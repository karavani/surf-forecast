import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import MapView from './pages/MapView';
import Spot from './pages/Spot';
import AddReview from './pages/AddReview';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/map" element={<MapView />} />
        <Route path="" element={<MapView />} />
        <Route path="/spot/:id" element={<Spot />} />
        <Route path="/add-review/:id" element={<AddReview />} />
      </Routes>
    </div>
  );
}

export default App;
