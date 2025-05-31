const cron = require('node-cron');
const Itinerary = require('../models/Itinerary');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { sendEmail } = require('./email');
const { sendWhatsApp } = require('./whatsapp');

// Initialize the scheduler
const initScheduler = () => {
  console.log('Initializing submission scheduler...');
  
  // Check for submissions every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled submission check...');
    await checkScheduledSubmissions();
  });
};

// Check for submissions that need to be processed
const checkScheduledSubmissions = async () => {
  try {
    const now = new Date();
    
    // Find itineraries that are scheduled for submission now
    const itineraries = await Itinerary.find({
      status: 'scheduled',
      scheduledSubmissionDate: { $lte: now }
    });
    
    console.log(`Found ${itineraries.length} itineraries to process`);
    
    for (const itinerary of itineraries) {
      // Find the associated submission
      const submission = await Submission.findOne({
        itinerary: itinerary._id,
        paymentStatus: 'paid'
      });
      
      if (!submission) {
        console.log(`No paid submission found for itinerary ${itinerary._id}`);
        continue;
      }
      
      // Update submission status
      submission.status = 'processing';
      await submission.save();
      
      // Update itinerary status
      itinerary.status = 'submitted';
      await itinerary.save();
      
      // Process the submission (in a real implementation, this would submit to the immigration system)
      await processSubmission(submission, itinerary);
    }
  } catch (err) {
    console.error('Error in scheduled submission check:', err);
  }
};

// Process a submission
const processSubmission = async (submission, itinerary) => {
  try {
    console.log(`Processing submission ${submission._id} for itinerary ${itinerary._id}`);
    
    // Simulate API call to immigration system
    // In a real implementation, this would make an actual API call
    
    // Simulate processing time (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock confirmation number
    const confirmationNumber = `ARR-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;
    
    // Update submission with confirmation
    submission.status = 'completed';
    submission.confirmationNumber = confirmationNumber;
    submission.submissionDate = new Date();
    submission.notes = 'Submission processed successfully';
    await submission.save();
    
    // Send notification to user
    const user = await User.findById(submission.user);
    
    if (user.preferredNotification === 'email' || user.preferredNotification === 'both') {
      await sendEmail(
        user.email,
        'Arrival Card Submission Completed',
        `Your arrival card for ${itinerary.destinationCountry} has been successfully submitted. Confirmation number: ${confirmationNumber}`
      );
    }
    
    if (user.preferredNotification === 'whatsapp' || user.preferredNotification === 'both') {
      await sendWhatsApp(
        user.phone,
        `Your arrival card for ${itinerary.destinationCountry} has been successfully submitted. Confirmation number: ${confirmationNumber}`
      );
    }
    
    submission.notificationsSent.completion = true;
    await submission.save();
    
    console.log(`Submission ${submission._id} processed successfully`);
  } catch (err) {
    console.error(`Error processing submission ${submission._id}:`, err);
    
    // Update submission with error
    submission.status = 'failed';
    submission.notes = `Error processing submission: ${err.message}`;
    await submission.save();
  }
};

module.exports = {
  initScheduler,
  checkScheduledSubmissions
};