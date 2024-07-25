const express = require('express');
const router = express.Router();
const { getAllSpots, createSpot, addReview } = require('../controllers/spots');

router.get('/', getAllSpots);
router.post('/', createSpot);
router.post('/:id/reviews', addReview);

module.exports = router;
