const { User } = require('../models');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, nationality, passportNumber, preferredNotification } = req.body;
    
    // Find user by id
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update fields
    const updatedData = {};
    if (name) updatedData.name = name;
    if (phone) updatedData.phone = phone;
    if (nationality) updatedData.nationality = nationality;
    if (passportNumber) updatedData.passportNumber = passportNumber;
    if (preferredNotification) updatedData.preferredNotification = preferredNotification;
    
    await user.update(updatedData);
    
    // Get updated user
    const updatedUser = await User.findByPk(req.user.id);
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    // Only admin can access all users
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    const users = await User.findAll();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};