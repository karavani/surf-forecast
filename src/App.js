import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MapView from './pages/MapView';
import Spot from './pages/Spot';
import AddReview from './pages/AddReview';

function App() {
  return (
    <Routes>
      <Route path="/map" element={<MapView />} />
      <Route path="" element={<MapView />} />
      <Route path="/spot/:id" element={<Spot />} />
      <Route path="/add-review/:id" element={<AddReview />} />
    </Routes>
  );
}

export default App;
