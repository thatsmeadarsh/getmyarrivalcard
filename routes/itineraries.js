const express = require('express');
const {
  uploadItinerary,
  getItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary
} = require('../controllers/itineraries');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(protect, uploadItinerary)
  .get(protect, getItineraries);

router
  .route('/:id')
  .get(protect, getItinerary)
  .put(protect, updateItinerary)
  .delete(protect, deleteItinerary);

module.exports = router;