const Spot = require('../models/Spot');

exports.getAllSpots = async (req, res) => {
  try {
    const spots = await Spot.find();
    res.json(spots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSpot = async (req, res) => {
  const { name, lat, lon } = req.body;
  const newSpot = new Spot({ name, lat, lon });

  try {
    const savedSpot = await newSpot.save();
    res.status(201).json(savedSpot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addReview = async (req, res) => {
  const { id } = req.params;
  const { review } = req.body;

  try {
    const spot = await Spot.findById(id);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    spot.reviews.push({ review });
    await spot.save();

    res.status(201).json(spot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
