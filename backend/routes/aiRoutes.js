const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getTravelSafetyScore,
  getAccommodationRecommendations,
  chatWithEventAI
} = require('../controllers/aiController');

// No auth required — interests are passed in request body/query
router.post('/recommend', getRecommendations);
router.get('/recommend', getRecommendations);
router.post('/safety-score', getTravelSafetyScore);
router.post('/accommodations', getAccommodationRecommendations);
router.post('/chat', chatWithEventAI);

module.exports = router;
