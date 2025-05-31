const { Submission, Itinerary } = require('../models');

// @desc    Get all submissions for user
// @route   GET /api/submissions
// @access  Private
exports.getSubmissions = async (req, res) => {
  try {
    let submissions;
    
    if (req.user.role === 'admin') {
      // Admin can see all submissions
      submissions = await Submission.findAll({
        order: [['createdAt', 'DESC']]
      });
    } else {
      // Regular users can only see their own submissions
      submissions = await Submission.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
    }
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    // Make sure user owns submission or is admin
    if (submission.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this submission'
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private (Admin only)
exports.updateSubmission = async (req, res) => {
  try {
    let submission = await Submission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    // Only admin can update submission status
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update submission status'
      });
    }
    
    // Update submission
    await submission.update(req.body);
    
    // If status is updated to completed, update the itinerary status as well
    if (req.body.status === 'completed') {
      const itinerary = await Itinerary.findByPk(submission.itineraryId);
      if (itinerary) {
        await itinerary.update({ status: 'completed' });
      }
    }
    
    // Fetch updated submission
    submission = await Submission.findByPk(req.params.id);
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Process payment for submission
// @route   POST /api/submissions/:id/payment
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    // Make sure user owns submission
    if (submission.userId !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to process payment for this submission'
      });
    }
    
    // Check if payment is already processed
    if (submission.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment already processed'
      });
    }
    
    // Process payment (simplified for this example)
    // In a real implementation, you would integrate with a payment gateway
    const paymentId = `PAY-${Date.now()}`;
    
    // Update submission with payment info
    await submission.update({
      paymentStatus: 'paid',
      paymentId
    });
    
    // Update itinerary status to scheduled
    const itinerary = await Itinerary.findByPk(submission.itineraryId);
    if (itinerary) {
      await itinerary.update({ status: 'scheduled' });
    }
    
    res.status(200).json({
      success: true,
      data: {
        paymentId,
        amount: submission.amount,
        currency: submission.currency,
        status: 'paid'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};