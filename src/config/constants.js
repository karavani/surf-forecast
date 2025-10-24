// API Configuration
export const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || '0a145abc27717a344615bbbeccfdad8c';
export const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Wave calculation constants
export const FETCH_LENGTH = 50000; // 50 km - המרחק שהרוח פועלת על המים
export const SMB_COEFFICIENT = 0.21; // מקדם נוסחת SMB לחישוב גובה גלים

// Time zones
export const ISRAEL_TIMEZONE = 'Asia/Jerusalem';

// Map configuration
export const ISRAEL_MAP_CENTER = [32.0853, 34.7818]; // תל אביב
export const ISRAEL_MAP_BOUNDS = [
  [29.0, 34.0],
  [33.5, 35.9],
];

