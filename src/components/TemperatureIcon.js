import React from 'react';

const TemperatureIcon = ({ temperature }) => {
  const getTemperatureIcon = () => {
    if (temperature <= 0) {
      return '❄️'; // קר מאוד
    } else if (temperature > 0 && temperature <= 15) {
      return '🌡️'; // קר
    } else if (temperature > 15 && temperature <= 25) {
      return '☀️'; // נעים
    } else {
      return '🔥'; // חם
    }
  };

  return (
    <span className="temperature-icon" style={{ marginRight: '5px' }}>
      {getTemperatureIcon()}
    </span>
  );
};

export default TemperatureIcon;
