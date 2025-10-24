import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SurfForecastTable.css";
import { OPENWEATHER_API_KEY, OPENWEATHER_BASE_URL } from '../config/constants';

const SurfForecastTable = ({ lat, lon }) => {
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    if (lat && lon) {
      axios
        .get(
          `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
        )
        .then((response) => {
          setForecastData(response.data.list);
        })
        .catch((error) => {
          console.error("שגיאה בטעינת תחזית מזג אוויר:", error);
          setForecastData([]);
        });
    }
  }, [lat, lon]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupForecastByDay = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString("he-IL");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  const groupedData = groupForecastByDay(forecastData);

  return (
    <div className="surf-forecast-container">
      <h2>תחזית גלים שבועית 📅</h2>
      {Object.keys(groupedData).length > 0 ? (
        Object.keys(groupedData).map((day) => (
          <div key={day} className="forecast-day">
            <h4>{day}</h4>
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>⏰ זמן</th>
                  <th>🌊 גלים</th>
                  <th>💨 רוח</th>
                  <th>🌡️ טמפ'</th>
                </tr>
              </thead>
              <tbody>
                {groupedData[day].map((forecast, index) => (
                  <tr key={index}>
                    <td>{formatTime(forecast.dt)}</td>
                    <td>0-0.3 מ'</td>
                    <td>
                      {forecast.wind.speed} מ'/ש{" "}
                      <span style={{ display: 'inline-block', transform: `rotate(${forecast.wind.deg}deg)` }}>
                        ➡️
                      </span>
                    </td>
                    <td>
                      {Math.round(forecast.main.temp)}°C{" "}
                      {forecast.weather[0].main === 'Clear' ? '☀️' : 
                       forecast.weather[0].main === 'Clouds' ? '☁️' :
                       forecast.weather[0].main === 'Rain' ? '🌧️' : 
                       forecast.weather[0].main === 'Thunderstorm' ? '⛈️' : '🌤️'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>טוען נתוני מזג אוויר... ⌛</p>
      )}
    </div>
  );
};

export default SurfForecastTable;
