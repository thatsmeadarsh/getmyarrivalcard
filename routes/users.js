const express = require('express');
const { updateProfile, getUsers } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), getUsers);

module.exports = router;