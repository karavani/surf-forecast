import L from 'leaflet';

/**
 * יצירת Custom Marker Icon לפי איכות גלים
 * בהשראת Surfline - מציג את איכות הגלים ישירות על המפה
 */

// קבלת צבע לפי גובה גלים
const getMarkerColor = (waveHeight) => {
  if (waveHeight >= 2.5) return '#00C853'; // ירוק - EPIC
  if (waveHeight >= 1.5) return '#64DD17'; // ירוק-צהוב - GOOD
  if (waveHeight >= 0.8) return '#FFD600'; // צהוב - FAIR
  if (waveHeight >= 0.3) return '#FF6D00'; // כתום - POOR
  return '#9E9E9E'; // אפור - FLAT
};

// קבלת טקסט איכות
const getQualityText = (waveHeight) => {
  if (waveHeight >= 2.5) return 'EPIC';
  if (waveHeight >= 1.5) return 'GOOD';
  if (waveHeight >= 0.8) return 'FAIR';
  if (waveHeight >= 0.3) return 'POOR';
  return 'FLAT';
};

/**
 * יצירת HTML של marker מותאם אישית
 */
const createMarkerHTML = (waveHeight, color, quality) => {
  return `
    <div class="custom-surf-marker" style="
      background: ${color};
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: all 200ms ease;
    ">
      <div style="
        font-size: 14px;
        font-weight: 700;
        color: white;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        line-height: 1;
      ">${waveHeight.toFixed(1)}</div>
      <div style="
        font-size: 9px;
        font-weight: 700;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        margin-top: 2px;
        letter-spacing: 0.3px;
      ">מ'</div>
    </div>
  `;
};

/**
 * יצירת Marker Icon מותאם אישית
 */
export const createCustomMarker = (waveHeight) => {
  const color = getMarkerColor(waveHeight);
  const quality = getQualityText(waveHeight);
  
  return L.divIcon({
    className: 'custom-marker-icon',
    html: createMarkerHTML(waveHeight, color, quality),
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

/**
 * יצירת Marker ברירת מחדל (אם אין נתוני גלים)
 */
export const createDefaultMarker = () => {
  const html = `
    <div class="custom-surf-marker" style="
      background: #9E9E9E;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
    ">
      <span style="
        font-size: 18px;
        filter: grayscale(1);
      ">📍</span>
    </div>
  `;

  return L.divIcon({
    className: 'custom-marker-icon',
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

/**
 * יצירת tooltip עם מידע מהיר
 */
export const createTooltipContent = (spotName, waveHeight, windSpeed, quality) => {
  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      border-radius: 8px;
      text-align: center;
      backdrop-filter: blur(10px);
    ">
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">
        ${spotName}
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        🌊 ${waveHeight} מ' | 💨 ${windSpeed} מ'/ש
      </div>
      <div style="
        font-size: 10px;
        font-weight: 700;
        margin-top: 4px;
        padding: 2px 6px;
        background: ${getMarkerColor(waveHeight)};
        border-radius: 4px;
        display: inline-block;
      ">
        ${quality}
      </div>
    </div>
  `;
};

