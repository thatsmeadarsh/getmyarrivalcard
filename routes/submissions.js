const express = require('express');
const { 
  getSubmissions, 
  getSubmission, 
  updateSubmission, 
  processPayment 
} = require('../controllers/submissions');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private
router.get('/', protect, getSubmissions);

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
router.get('/:id', protect, getSubmission);

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), updateSubmission);

// @desc    Process payment for submission
// @route   POST /api/submissions/:id/payment
// @access  Private
router.post('/:id/payment', protect, processPayment);

module.exports = router;