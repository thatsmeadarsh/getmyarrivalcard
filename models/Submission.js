const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Submission = sequelize.define('Submission', {
  itineraryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processing', 'completed', 'failed']]
    }
  },
  submissionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmationNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  arrivalCardPdf: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'unpaid',
    validate: {
      isIn: [['unpaid', 'processing', 'paid', 'refunded']]
    }
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  confirmationNotificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderNotificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completionNotificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Submission;