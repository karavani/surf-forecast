import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { setSpots } from '../actions';
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import SurfForecastTable from "../components/SurfForecastTable";
import "./MapView.css";
import { Sheet } from 'react-modal-sheet';
import { useSwipeable } from 'react-swipeable';

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
  iconUrl: '/surf-forecast/leaflet/marker-icon.png',
  iconRetinaUrl: '/surf-forecast/leaflet/marker-icon-2x.png',
  shadowUrl: '/surf-forecast/leaflet/marker-shadow.png',
});

const FETCH_LENGTH = 50000; // 50 km

const MapView = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots.spots);
  const [weatherData, setWeatherData] = useState({});
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const markerRefs = useRef({});
  const [swipeDirection, setSwipeDirection] = useState(null);

  // האזנה לשינויי גודל מסך
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    dispatch(setSpots());
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
    const currentIndex = spots.findIndex((spot) => spot._id === selectedSpot._id);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= spots.length) newIndex = 0;
    if (newIndex < 0) newIndex = spots.length - 1;
    setSelectedSpot(spots[newIndex]);
  };

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (isMobile && showModal) {
        setSwipeDirection('right');
        getNextSpot("prev");
        setTimeout(() => setSwipeDirection(null), 300);
      }
    },
    onSwipedLeft: () => {
      if (isMobile && showModal) {
        setSwipeDirection('left');
        getNextSpot("next");
        setTimeout(() => setSwipeDirection(null), 300);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    delta: 50,
    swipeDuration: 500,
  });

  const renderContent = () => (
    <div 
      {...swipeHandlers} 
      className={swipeDirection ? `swiping-${swipeDirection}` : ''}
    >
      <div className="current-conditions">
        <h3>תחזית גלים עכשיו</h3>
        <p>טמפרטורה: {Math.round(weatherData[selectedSpot._id].main.temp - 273.15)}°C</p>
        <p>מהירות רוח: {weatherData[selectedSpot._id].wind.speed} מ'/ש</p>
        <p>גובה גלים: {weatherData[selectedSpot._id].waveHeight} מ'</p>
        <p>מצב: {weatherData[selectedSpot._id].weatherDescription}</p>
        <p>זריחה: {weatherData[selectedSpot._id].sunrise}</p>
        <p>שקיעה: {weatherData[selectedSpot._id].sunset}</p>
      </div>
      
      <SurfForecastTable lat={selectedSpot?.lat} lon={selectedSpot?.lon} />
      
      <div className="reviews">
        <h3>ביקורות:</h3>
        {selectedSpot.reviews.map((review, index) => (
          <p key={index}>📝 {review.review}</p>
        ))}
      </div>

      {isMobile ? (
        <div className="swipe-navigation">
          <div className="swipe-arrow left" onClick={() => getNextSpot("prev")}>
            <span className="arrow">→</span>
            <span className="text">קודם</span>
          </div>
          <div className="swipe-hint">החלק או לחץ</div>
          <div className="swipe-arrow right" onClick={() => getNextSpot("next")}>
            <span className="text">הבא</span>
            <span className="arrow">←</span>
          </div>
        </div>
      ) : (
        <div className="navigation-buttons">
          <Button variant="secondary" onClick={() => getNextSpot("prev")}>
            ➡️ קודם
          </Button>
          <Button variant="primary" onClick={() => getNextSpot("next")}>
            הבא ⬅️
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="map-container">
      <MapContainer
        center={[32.0853, 34.7818]}
        zoom={8}
        style={{ height: "100vh", width: "100%" }}
        maxBounds={[
          [29.0, 34.0],
          [33.5, 35.9],
        ]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />
        <MapComponent
          spots={spots}
          selectedSpot={selectedSpot}
          handleMarkerClick={handleMarkerClick}
          markerRefs={markerRefs}
        />
      </MapContainer>

      {!isMobile && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{selectedSpot?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedSpot && weatherData[selectedSpot._id] ? (
              renderContent()
            ) : (
              <p>טוען... ⌛</p>
            )}
          </Modal.Body>
        </Modal>
      )}

      {isMobile && (
        <Sheet
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          snapPoints={[0.9, 0.5]}
          initialSnap={1}
        >
          <Sheet.Container>
            <Sheet.Header>
              <div className="sheet-header">
                <h2>{selectedSpot?.name}</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>
            </Sheet.Header>
            <Sheet.Content>
              {selectedSpot && weatherData[selectedSpot._id] ? (
                <div className="sheet-content">
                  {renderContent()}
                </div>
              ) : (
                <div className="loading-container">
                  <p>טוען... ⌛</p>
                </div>
              )}
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onTap={() => setShowModal(false)} />
        </Sheet>
      )}
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
