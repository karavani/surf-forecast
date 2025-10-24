/**
 * Weather Cache Utility
 * מנהל cache לנתוני מזג אוויר כדי להפחית בקשות API ולשפר ביצועים
 */

const CACHE_DURATION = 10 * 60 * 1000; // 10 דקות
const CACHE_KEY_PREFIX = 'weather_cache_';

/**
 * שמירת נתונים ב-cache
 * @param {string} spotId - מזהה הנקודה
 * @param {object} data - הנתונים לשמירה
 */
export const setCacheData = (spotId, data) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${spotId}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to cache weather data:', error);
  }
};

/**
 * קבלת נתונים מ-cache
 * @param {string} spotId - מזהה הנקודה
 * @returns {object|null} - הנתונים או null אם לא קיימים/פג תוקפם
 */
export const getCacheData = (spotId) => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${spotId}`);
    if (!cached) return null;

    const cacheItem = JSON.parse(cached);
    const now = Date.now();

    // בדיקה אם ה-cache עדיין תקף
    if (now - cacheItem.timestamp < CACHE_DURATION) {
      return cacheItem.data;
    }

    // אם פג תוקף, נמחק אותו
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${spotId}`);
    return null;
  } catch (error) {
    console.warn('Failed to retrieve cached weather data:', error);
    return null;
  }
};

/**
 * ניקוי כל ה-cache של מזג אוויר
 */
export const clearWeatherCache = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear weather cache:', error);
  }
};

/**
 * בדיקה אם נתונים קיימים ב-cache
 * @param {string} spotId - מזהה הנקודה
 * @returns {boolean}
 */
export const isCached = (spotId) => {
  return getCacheData(spotId) !== null;
};

