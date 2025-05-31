const { Itinerary, Submission } = require('../models');
const path = require('path');
const fs = require('fs');
const { uploadFile, getFile } = require('../utils/storage');

// @desc    Upload itinerary
// @route   POST /api/itineraries
// @access  Private
exports.uploadItinerary = async (req, res) => {
  try {
    if (!req.files || !req.files.itinerary) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an itinerary file'
      });
    }

    const file = req.files.itinerary;
    
    // Make sure the file is a PDF
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF file'
      });
    }
    
    // Create a custom filename
    const fileName = `itinerary_${req.user.id}_${Date.now()}${path.parse(file.name).ext}`;
    
    // Upload file to storage
    const fileUrl = await uploadFile(file, fileName);
    
    // Extract data from PDF (simplified for this example)
    // In a real implementation, you would use a PDF parsing library
    const extractedData = {
      destinationCountry: req.body.destinationCountry,
      arrivalDate: new Date(req.body.arrivalDate),
      departureDate: new Date(req.body.departureDate),
      flightNumber: req.body.flightNumber,
      airline: req.body.airline,
      accommodationAddress: req.body.accommodationAddress,
      accommodationPhone: req.body.accommodationPhone,
      purpose: req.body.purpose
    };
    
    // Create itinerary in database
    const itinerary = await Itinerary.create({
      userId: req.user.id,
      originalFile: fileUrl, // Store the file URL
      ...extractedData
    });
    
    // Create a submission record
    const submission = await Submission.create({
      itineraryId: itinerary.id,
      userId: req.user.id,
      amount: 19.99, // Service fee
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      data: {
        itinerary,
        submission
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

// @desc    Get all itineraries for user
// @route   GET /api/itineraries
// @access  Private
exports.getItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.findAll({ 
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: itineraries.length,
      data: itineraries
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single itinerary
// @route   GET /api/itineraries/:id
// @access  Private
exports.getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found'
      });
    }
    
    // Make sure user owns itinerary
    if (itinerary.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this itinerary'
      });
    }
    
    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update itinerary
// @route   PUT /api/itineraries/:id
// @access  Private
exports.updateItinerary = async (req, res) => {
  try {
    let itinerary = await Itinerary.findByPk(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found'
      });
    }
    
    // Make sure user owns itinerary
    if (itinerary.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this itinerary'
      });
    }
    
    // Check if submission is already in progress
    if (['submitted', 'completed'].includes(itinerary.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update itinerary after submission'
      });
    }
    
    // Update itinerary
    await itinerary.update(req.body);
    
    // Fetch updated itinerary
    itinerary = await Itinerary.findByPk(req.params.id);
    
    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete itinerary
// @route   DELETE /api/itineraries/:id
// @access  Private
exports.deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found'
      });
    }
    
    // Make sure user owns itinerary
    if (itinerary.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this itinerary'
      });
    }
    
    // Check if submission is already in progress
    if (['submitted', 'completed'].includes(itinerary.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete itinerary after submission'
      });
    }
    
    // Delete related submissions
    await Submission.destroy({ where: { itineraryId: itinerary.id } });
    
    // Delete itinerary
    await itinerary.destroy();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};