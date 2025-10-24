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
import { 
  OPENWEATHER_API_KEY, 
  OPENWEATHER_BASE_URL, 
  FETCH_LENGTH, 
  SMB_COEFFICIENT,
  ISRAEL_TIMEZONE,
  ISRAEL_MAP_CENTER,
  ISRAEL_MAP_BOUNDS
} from '../config/constants';
import { getCacheData, setCacheData } from '../utils/weatherCache';
import { createCustomMarker, createDefaultMarker, createTooltipContent } from '../utils/mapMarkers';

// Weather descriptions mapping to Hebrew
const weatherDescriptions = {
  "clear sky": "שמיים בהירים",
  "few clouds": "מעט עננים",
  "scattered clouds": "עננים מפוזרים",
  "broken clouds": "עננות משתנה",
  "overcast clouds": "מעונן",
  "shower rain": "ממטרים",
  "light rain": "גשם קל",
  "moderate rain": "גשם בינוני",
  "heavy intensity rain": "גשם כבד",
  "very heavy rain": "גשם שוטף",
  "extreme rain": "גשם קיצוני",
  rain: "גשם",
  "light intensity drizzle": "טפטוף קל",
  drizzle: "טפטוף",
  "heavy intensity drizzle": "טפטוף כבד",
  thunderstorm: "סופת רעמים",
  "thunderstorm with light rain": "סופת רעמים עם גשם קל",
  "thunderstorm with rain": "סופת רעמים עם גשם",
  "thunderstorm with heavy rain": "סופת רעמים עם גשם כבד",
  "light thunderstorm": "סופת רעמים קלה",
  "heavy thunderstorm": "סופת רעמים כבדה",
  "light snow": "שלג קל",
  snow: "שלג",
  "heavy snow": "שלג כבד",
  sleet: "גשם מעורב בשלג",
  mist: "ערפל",
  fog: "ערפל כבד",
  haze: "אובך",
  smoke: "עשן",
  sand: "חול",
  dust: "אבק",
  "sand/dust whirls": "מערבולות חול/אבק",
  tornado: "טורנדו",
  "volcanic ash": "אפר וולקני",
  squalls: "משבי רוח",
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

const MapView = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots.spots);
  const [weatherData, setWeatherData] = useState({});
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const markerRefs = useRef({});
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [loadingError, setLoadingError] = useState(false);

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
    if (spots.length === 0) return;

    setLoadingError(false);
    let errorCount = 0;

    spots.forEach((spot) => {
      // בדיקה אם יש נתונים שמורים ב-cache
      const cachedData = getCacheData(spot._id);
      if (cachedData) {
        // שימוש בנתונים מה-cache
        setWeatherData((prevData) => ({
          ...prevData,
          [spot._id]: cachedData,
        }));
        return; // דילוג על בקשת API
      }


      axios
        .get(
          `${OPENWEATHER_BASE_URL}/weather?lat=${spot.lat}&lon=${spot.lon}&appid=${OPENWEATHER_API_KEY}`
        )
        .then((response) => {
          const windSpeed = response.data.wind.speed; // m/s
          
          // תיקון באג קריטי: המרה נכונה מ-Unix timestamp לאובייקט Date
          // Unix timestamp הוא בשניות, צריך להכפיל ב-1000 (לא 2000!)
          const sunrise = new Date(
            response.data.sys.sunrise * 1000
          ).toLocaleTimeString("he-IL", {
            timeZone: ISRAEL_TIMEZONE, // שימוש באזור הזמן הנכון של ישראל
            hour: "2-digit",
            minute: "2-digit",
          });
          const sunset = new Date(
            response.data.sys.sunset * 1000
          ).toLocaleTimeString("he-IL", {
            timeZone: ISRAEL_TIMEZONE, // שימוש באזור הזמן הנכון של ישראל
            hour: "2-digit",
            minute: "2-digit",
          });

          // Calculate wave height using SMB formula
          // נוסחת SMB משוערכת: גובה גל = (מקדם * מהירות רוח²) / (מרחק אפקטיבי^⅓)
          const waveHeight =
            (SMB_COEFFICIENT * (windSpeed * windSpeed)) / Math.pow(FETCH_LENGTH, 1 / 3);

          const weatherDataItem = {
            ...response.data,
            waveHeight: waveHeight.toFixed(2), // Format wave height to 2 decimal places
            weatherDescription: translateWeatherDescription(
              response.data.weather[0].description
            ), // Translate weather description
            sunrise: sunrise,
            sunset: sunset,
          };

          // שמירת הנתונים ב-cache
          setCacheData(spot._id, weatherDataItem);

          setWeatherData((prevData) => ({
            ...prevData,
            [spot._id]: weatherDataItem,
          }));
        })
        .catch((error) => {
          console.error(`שגיאה בטעינת נתוני מזג אוויר עבור ${spot.name}:`, error);
          errorCount++;
          
          // אם יותר מ-70% מהבקשות נכשלו, הצג הודעת שגיאה כללית
          if (errorCount > spots.length * 0.7) {
            setLoadingError(true);
          }

          // הוסף placeholder לנתוני שגיאה כדי שהמשתמש יידע שיש בעיה
          setWeatherData((prevData) => ({
            ...prevData,
            [spot._id]: {
              error: true,
              message: "לא ניתן לטעון נתונים"
            },
          }));
        });
    });
  }, [spots]);

  const handleMarkerClick = (spot) => {
    setSelectedSpot(spot);
    setShowModal(true);
  };

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

  const renderContent = () => {
    // בדיקה אם יש שגיאה בטעינת הנתונים
    if (weatherData[selectedSpot._id]?.error) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>אופס! משהו השתבש</h3>
          <p>לא הצלחנו לטעון את נתוני מזג האוויר עבור {selectedSpot.name}</p>
          <p className="error-hint">אנא בדוק את החיבור לאינטרנט ונסה שוב</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            נסה שוב 🔄
          </button>
        </div>
      );
    }

    return (
      <div 
        {...swipeHandlers} 
        className={swipeDirection ? `swiping-${swipeDirection}` : ''}
      >
        {/* Wave Height Hero Card */}
        <div className="wave-height-card">
          <div className="wave-height-main">
            {weatherData[selectedSpot._id].waveHeight} מ'
          </div>
          <div className="wave-quality-badge">
            {weatherData[selectedSpot._id].waveHeight >= 2 ? 'FAIR TO GOOD' : 
             weatherData[selectedSpot._id].waveHeight >= 1 ? 'POOR TO FAIR' : 'FLAT'}
          </div>
        </div>

        {/* Weather Grid */}
        <div className="weather-grid">
          <div className="weather-item">
            <div className="weather-item-icon">💨</div>
            <div className="weather-item-label">רוח</div>
            <div className="weather-item-value">{weatherData[selectedSpot._id].wind.speed} מ'/ש</div>
          </div>
          
          <div className="weather-item">
            <div className="weather-item-icon">🌡️</div>
            <div className="weather-item-label">טמפרטורה</div>
            <div className="weather-item-value">{Math.round(weatherData[selectedSpot._id].main.temp - 273.15)}°C</div>
          </div>
          
          <div className="weather-item">
            <div className="weather-item-icon">🌅</div>
            <div className="weather-item-label">זריחה</div>
            <div className="weather-item-value">{weatherData[selectedSpot._id].sunrise}</div>
          </div>
          
          <div className="weather-item">
            <div className="weather-item-icon">🌇</div>
            <div className="weather-item-label">שקיעה</div>
            <div className="weather-item-value">{weatherData[selectedSpot._id].sunset}</div>
          </div>
        </div>

        {/* Weather Description */}
        <div className="current-conditions">
          <h3>מצב מזג האוויר</h3>
          <p>{weatherData[selectedSpot._id].weatherDescription}</p>
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
  };

  return (
    <div className="map-container">
      {/* App Header */}
      <div className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🏄‍♂️</span>
          <div>
            <div className="app-title">Surf IL</div>
            <div className="app-subtitle">תחזית גלים בזמן אמת</div>
          </div>
        </div>
        <div className="header-actions">
          <button className="header-button" title="רענן נתונים" onClick={() => window.location.reload()}>
            🔄
          </button>
        </div>
      </div>

      {loadingError && (
        <div className="global-error-banner">
          ⚠️ בעיה בטעינת נתוני מזג אוויר. בדוק את החיבור לאינטרנט ורענן את הדף.
          <button 
            className="close-banner"
            onClick={() => setLoadingError(false)}
          >
            ✕
          </button>
        </div>
      )}
      <MapContainer
        center={ISRAEL_MAP_CENTER}
        zoom={8}
        style={{ height: "100vh", width: "100%" }}
        maxBounds={ISRAEL_MAP_BOUNDS}
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
          weatherData={weatherData}
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
  weatherData,
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
      {spots.map((spot) => {
        // קבלת נתוני מזג אוויר עבור הנקודה
        const spotWeather = weatherData[spot._id];
        const waveHeight = spotWeather?.waveHeight ? parseFloat(spotWeather.waveHeight) : 0;
        const windSpeed = spotWeather?.wind?.speed || 0;
        
        // יצירת marker מותאם או ברירת מחדל
        const customIcon = spotWeather?.waveHeight 
          ? createCustomMarker(waveHeight)
          : createDefaultMarker();

        // קביעת class לאיכות (לאנימציית pulse)
        const qualityClass = waveHeight >= 2.5 ? 'marker-quality-epic' :
                            waveHeight >= 1.5 ? 'marker-quality-good' : '';

        return (
          <Marker
            key={spot._id}
            position={[spot.lat, spot.lon]}
            icon={customIcon}
            onClick={() => {
              handleMarkerClick(spot);
              map.flyTo([spot.lat, spot.lon], 12);
            }}
            ref={(el) => {
              markerRefs.current[spot._id] = el;
              // הוספת class לאיכות
              if (el && qualityClass) {
                setTimeout(() => {
                  const markerElement = el._icon;
                  if (markerElement) {
                    markerElement.classList.add(qualityClass);
                  }
                }, 100);
              }
            }}
            eventHandlers={{
              mouseover: (e) => {
                // הצגת tooltip עם מידע מהיר
                if (spotWeather?.waveHeight) {
                  const quality = waveHeight >= 2.5 ? 'EPIC' :
                                 waveHeight >= 1.5 ? 'GOOD' :
                                 waveHeight >= 0.8 ? 'FAIR' :
                                 waveHeight >= 0.3 ? 'POOR' : 'FLAT';
                  
                  e.target.bindTooltip(
                    createTooltipContent(spot.name, waveHeight, windSpeed, quality),
                    {
                      permanent: false,
                      direction: 'top',
                      className: 'custom-tooltip'
                    }
                  ).openTooltip();
                }
              },
              mouseout: (e) => {
                e.target.closeTooltip();
              }
            }}
          >
            <Popup>
              <div style={{ padding: '12px' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '1.1rem',
                  color: '#1A1A1A',
                  fontWeight: '700'
                }}>
                  {spot.name}
                </h3>
                {spotWeather?.waveHeight && (
                  <div style={{ 
                    fontSize: '0.9rem',
                    color: '#5F6368',
                    marginBottom: '8px'
                  }}>
                    🌊 {waveHeight} מ' | 💨 {windSpeed} מ'/ש
                  </div>
                )}
                <button
                  style={{
                    background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    width: '100%',
                    fontSize: '0.9rem'
                  }}
                  onClick={() => {
                    handleMarkerClick(spot);
                    map.flyTo([spot.lat, spot.lon], 12);
                  }}
                >
                  לחץ לפרטים מלאים 🏄‍♂️
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default MapView;
