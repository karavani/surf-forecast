import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchSpots } from "../actions";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import SurfForecastTable from "../components/SurfForecastTable"; // Import the table component
import "./MapView.css"; // Custom CSS for overlay and other styles"
import TemperatureIcon from '../components/TemperatureIcon';

// Weather descriptions mapping to Hebrew
const weatherDescriptions = {
  "clear sky": "שמיים בהירים",
  "few clouds": "מעט עננים",
  "scattered clouds": "עננים מפוזרים",
  "broken clouds": "עננים שבורים",
  "shower rain": "גשם קל",
  rain: "גשם",
  thunderstorm: "סערה",
  snow: "שלג",
  mist: "ערפל",
};

const translateWeatherDescription = (description) => {
  return weatherDescriptions[description] || description;
};

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const FETCH_LENGTH = 50000; // 50 km

const MapView = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots.spots);
  const [weatherData, setWeatherData] = useState({});
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const markerRefs = useRef({});

  useEffect(() => {
    dispatch(fetchSpots());
  }, [dispatch]);

  useEffect(() => {
    spots.forEach((spot) => {
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${spot.lat}&lon=${spot.lon}&appid=0a145abc27717a344615bbbeccfdad8c`
        )
        .then((response) => {
          const windSpeed = response.data.wind.speed; // m/s
          const sunrise = new Date(
            response.data.sys.sunrise * 2000
          ).toLocaleTimeString("he-IL", {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit",
          });
          const sunset = new Date(
            response.data.sys.sunset * 2190
          ).toLocaleTimeString("he-IL", {
            timeZone: "UTC",
            hour: "2-digit",
            minute: "2-digit",
          });

          // Calculate wave height using SMB formula
          const waveHeight =
            (0.21 * (windSpeed * windSpeed)) / Math.pow(FETCH_LENGTH, 1 / 3);

          setWeatherData((prevData) => ({
            ...prevData,
            [spot._id]: {
              ...response.data,
              waveHeight: waveHeight.toFixed(2), // Format wave height to 2 decimal places
              weatherDescription: translateWeatherDescription(
                response.data.weather[0].description
              ), // Translate weather description
              sunrise: sunrise,
              sunset: sunset,
            },
          }));
        })
        .catch((error) => console.error("Error fetching weather data:", error));
    });
  }, [spots]);

  const handleMarkerClick = (spot) => {
    setSelectedSpot(spot);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const getNextSpot = (direction) => {
    if (!selectedSpot) return;

    const currentIndex = spots.findIndex(
      (spot) => spot._id === selectedSpot._id
    );
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= spots.length) newIndex = 0; // Wrap around to the start
    if (newIndex < 0) newIndex = spots.length - 1; // Wrap around to the end

    const newSpot = spots[newIndex];
    setSelectedSpot(newSpot);
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer
        center={[32.0853, 34.7818]}
        zoom={8}
        style={{ height: "100vh", width: "100%" }}
        maxBounds={[
          [29.0, 34.0], // Southwest corner of Israel
          [33.5, 35.9], // Northeast corner of Israel
        ]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap contributors'
        />
        <MapComponent
          spots={spots}
          selectedSpot={selectedSpot}
          handleMarkerClick={handleMarkerClick}
          markerRefs={markerRefs}
        />
      </MapContainer>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedSpot?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSpot && weatherData[selectedSpot._id] ? (
            <>
              <div style={{ padding: "20px 0" }}>
                <h2>תחזית גלים עכשיו</h2>
                <h6
                  style={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.125)",
                    paddingBottom: "5px",
                  }}
                >
                  {new Date().toLocaleString("he-IL")}
                </h6>
                <br />
                <div className="nowForecastDiv">
                  <p>
                    טמפרטורה:{" "}
                    {Math.round(
                      weatherData[selectedSpot._id].main.temp - 273.15
                    )}
                    °C
                    <TemperatureIcon temperature={weatherData[selectedSpot._id].main.temp - 273.15} />
                  </p>
                  <p>
                    מצב: {weatherData[selectedSpot._id].weatherDescription}
                    <img
                      src={`http://openweathermap.org/img/wn/${
                        weatherData[selectedSpot._id].weather[0].icon
                      }.png`}
                      alt={weatherData[selectedSpot._id].weatherDescription}
                      title={weatherData[selectedSpot._id].weatherDescription}
                    />
                  </p>
                  <p>
                    מהירות רוח: {weatherData[selectedSpot._id].wind.speed} מ'
                    לשנייה{" "}
                    <img
                      style={{ width: "15px" }}
                      src={"/././wind-icon.png"}
                      alt={weatherData[selectedSpot._id].weatherDescription}
                      title={weatherData[selectedSpot._id].weatherDescription}
                    />
                  </p>
                  <p>
                    כיוון הרוח: {weatherData[selectedSpot._id].wind.deg}°
                    <span style={{ marginRight: "8px" }}>
                      <span
                        style={{
                          transform: `rotate(${
                            weatherData[selectedSpot._id].wind.deg
                          }deg)`,
                          position: "absolute",
                        }}
                      >
                        ↑
                      </span>
                    </span>
                  </p>
                  <p>
                    גובה הגלים: {weatherData[selectedSpot._id].waveHeight} מ'{" "}
                    <img
                      style={{ width: "30px" }}
                      src={"/././wave-icon.png"}
                      alt={weatherData[selectedSpot._id].weatherDescription}
                      title={weatherData[selectedSpot._id].weatherDescription}
                    />
                  </p>

                  <p>
                    זריחה: {weatherData[selectedSpot._id].sunrise}{" "}
                    <img
                      style={{ width: "30px" }}
                      src={"/././sunrise-icon.png"}
                      alt={weatherData[selectedSpot._id].weatherDescription}
                      title={weatherData[selectedSpot._id].weatherDescription}
                    />
                  </p>
                  <p>
                    שקיעה: {weatherData[selectedSpot._id].sunset}{" "}
                    <img
                      style={{ width: "30px" }}
                      src={"/././moonrise-icon.png"}
                      alt={weatherData[selectedSpot._id].weatherDescription}
                      title={weatherData[selectedSpot._id].weatherDescription}
                    />
                  </p>
                </div>
              </div>
              <SurfForecastTable
                lat={selectedSpot?.lat}
                lon={selectedSpot?.lon}
              />
              <div>
                <h2>ביקורות:</h2>
                <ul>
                  {selectedSpot.reviews.map((review, index) => (
                    <li key={index}>{review.review}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p>טוען...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => getNextSpot("prev")}>
            קודם
          </Button>
          <Button variant="primary" onClick={() => getNextSpot("next")}>
            הבא
          </Button>
        </Modal.Footer>
      </Modal>
      {showModal && <div className="overlay" />}
    </div>
  );
};

// Component that uses `useMap()` hook
const MapComponent = ({
  spots,
  selectedSpot,
  handleMarkerClick,
  markerRefs,
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedSpot) {
      map.flyTo([selectedSpot.lat, selectedSpot.lon], 12);
      const marker = markerRefs.current[selectedSpot._id];
      if (marker) {
        marker.openPopup(); // Open the popup for the selected spot
      }
    }
  }, [selectedSpot, map, markerRefs]);

  return (
    <>
      {spots.map((spot) => (
        <Marker
          key={spot._id}
          position={[spot.lat, spot.lon]}
          onClick={() => {
            handleMarkerClick(spot);
            map.flyTo([spot.lat, spot.lon], 12);
          }}
          ref={(el) => {
            markerRefs.current[spot._id] = el;
          }}
        >
          <Popup>
            <div>
              <h3>{spot.name}</h3>
              <p
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleMarkerClick(spot);
                  map.flyTo([spot.lat, spot.lon], 12);
                }}
              >
                לחץ לפרטים נוספים
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default MapView;
