import React from 'react';

// Define the temperature ranges and corresponding icon URLs
const getTemperatureIcon = (temperature) => {
  if (temperature <= 0) {
    return '/././low-temperature-icon.png'; // Cold icon
  } else if (temperature > 0 && temperature <= 15) {
    return '/././low-temperature-icon.png'; // Cool icon
  } else if (temperature > 15 && temperature <= 25) {
    return '/././medium-temperature-icon.png'; // Mild icon
  } else if (temperature > 25) {
    return '/././high-temperature-icon.png'; // Hot icon
  }
};

const TemperatureIcon = ({ temperature }) => {
  const iconUrl = getTemperatureIcon(temperature);

  return (
    <div className="temperature-icon">
      <img src={iconUrl} alt="Temperature Icon" style={{ width: '20px' }} />
    </div>
  );
};

export default TemperatureIcon;
