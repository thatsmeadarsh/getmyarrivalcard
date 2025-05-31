const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Itinerary = sequelize.define('Itinerary', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  destinationCountry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  arrivalDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  departureDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  flightNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  airline: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accommodationAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accommodationPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['tourism', 'business', 'education', 'other']]
    }
  },
  originalFile: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'scheduled', 'submitted', 'completed', 'failed']]
    }
  },
  scheduledSubmissionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  submissionWindowStart: {
    type: DataTypes.DATE,
    allowNull: true
  },
  submissionWindowEnd: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (itinerary) => {
      if (itinerary.arrivalDate && (!itinerary.submissionWindowStart || !itinerary.submissionWindowEnd)) {
        // Set submission window to start 72 hours before arrival
        const arrivalDate = new Date(itinerary.arrivalDate);
        const submissionStart = new Date(arrivalDate);
        submissionStart.setHours(arrivalDate.getHours() - 72);
        
        // End submission window 2 hours before arrival
        const submissionEnd = new Date(arrivalDate);
        submissionEnd.setHours(arrivalDate.getHours() - 2);
        
        itinerary.submissionWindowStart = submissionStart;
        itinerary.submissionWindowEnd = submissionEnd;
        
        // Calculate the optimal time to submit (middle of the window)
        const scheduledTime = new Date(submissionStart.getTime() + 
          (submissionEnd.getTime() - submissionStart.getTime()) / 2);
        
        itinerary.scheduledSubmissionDate = scheduledTime;
      }
    }
  }
});

module.exports = Itinerary;