const User = require('./User');
const Itinerary = require('./Itinerary');
const Submission = require('./Submission');

// Define associations
User.hasMany(Itinerary, { foreignKey: 'userId', as: 'itineraries' });
Itinerary.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Itinerary.hasMany(Submission, { foreignKey: 'itineraryId', as: 'submissions' });
Submission.belongsTo(Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

module.exports = {
  User,
  Itinerary,
  Submission
};