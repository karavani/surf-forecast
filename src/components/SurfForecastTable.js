import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SurfForecastTable.css"; // Import your CSS file for styling
const SurfForecastTable = ({ lat, lon }) => {
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    if (lat && lon) {
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=0a145abc27717a344615bbbeccfdad8c`
        )
        .then((response) => {
          setForecastData(response.data.list);
        })
        .catch((error) => console.error("Error fetching weather data:", error));
    }
  }, [lat, lon]);

  const formatTime = (dt) => {
    const date = new Date(dt * 1000);
    return `${date.getHours()}:00`;
  };

  const formatDay = (dt) => {
    const date = new Date(dt * 1000);
    return date.toLocaleDateString("he-IL", { weekday: "long" });
  };

  // Group data by day
  const groupedData = forecastData.reduce((acc, forecast) => {
    const day = formatDay(forecast.dt);
    if (!acc[day]) acc[day] = [];
    acc[day].push(forecast);
    return acc;
  }, {});

  return (
    <div className="surf-forecast-container">
      <h2>תחזית גלים שבועית</h2>
      {Object.keys(groupedData).length > 0 ? (
        Object.keys(groupedData).map((day, dayIndex) => (
          <table key={day} className="forecast-table">
            <thead>
              {" "}
              <h4>{day}</h4>
             
              <tr>
                <th>זמן</th>
                <th>גלים (מ')</th>
                <th>רוח</th>
                <th>מזג אוויר</th>
              </tr>
            </thead>
            <tbody>
              {groupedData[day].map((forecast, index) => (
                <tr key={index}>
                  <td>{formatTime(forecast.dt)}</td>
                  <td>0-0.3</td> {/* Placeholder value for surf */}
                  <td>
                    {forecast.wind.speed} מ'/ש{" "}
                    <span style={{ marginRight: "8px" }}>
                    <span
                      style={{ transform: `rotate(${forecast.wind.deg}deg)`, position: 'absolute' }}
                      >
                      ↑
                    </span>
                        </span>
                  </td>
                  <td>
                    {forecast.main.temp}°C{" "}
                    <img
                      src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                      alt={forecast.weather[0].description}
                      title={forecast.weather[0].description}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))
      ) : (
        <p>טוען נתוני מזג אוויר...</p>
      )}
    </div>
  );
};

export default SurfForecastTable;
