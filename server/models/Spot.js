const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: String,
  date: { type: Date, default: Date.now },
});

const spotSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lon: Number,
  reviews: [reviewSchema],
});

const Spot = mongoose.model('Spot', spotSchema);

module.exports = Spot;
