const express = require('express');
const bodyParser = require('body-parser');
const spots = require('./mockData'); // Import the mock data

const app = express();

app.use(bodyParser.json());

// Mock database (for development purposes)
let spotsData = spots;

// Routes
app.get('/api/spots', (req, res) => {
  res.json(spotsData);
});

app.post('/api/spots/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { review } = req.body;

  const spot = spotsData.find(spot => spot._id === id);
  if (spot) {
    spot.reviews.push({ review });
    res.json(spot);
  } else {
    res.status(404).json({ message: 'Spot not found' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
