/**
 * API Configuration
 *
 * saudi-app (Django) serves its API under `/api` with no version prefix.
 * Point EXPO_PUBLIC_API_BASE_URL at your machine's LAN IP when testing on a
 * physical device — e.g. http://192.168.1.23:8080/api — since the device
 * can't resolve "localhost" as your dev machine.
 */
export const API_CONFIG = {
  // Django dev server default port (manage.py runserver 0.0.0.0:8080)
  BASE_URL_DEV_ANDROID: 'http://10.0.2.2:8080/api',   // Android emulator → host machine
  BASE_URL_DEV_IOS: 'http://localhost:8080/api',      // iOS simulator → host machine
  BASE_URL_DEV_WEB: 'http://localhost:8080/api',      // Browser → host machine
  BASE_URL_PROD: 'https://saudidashboard.pythonanywhere.com/api',

  get BASE_URL() {
    const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (envBaseUrl) return envBaseUrl;

    if (!__DEV__) return this.BASE_URL_PROD;

    try {
      const { Platform } = require('react-native');
      if (Platform.OS === 'web') return this.BASE_URL_DEV_WEB;
      if (Platform.OS === 'ios') return this.BASE_URL_DEV_IOS;
      return this.BASE_URL_DEV_ANDROID;
    } catch {
      return this.BASE_URL_DEV_WEB;
    }
  },

  TIMEOUT: 20000,
  ENABLE_LOGGING: __DEV__,
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  TWO_FACTOR_STATUS: '/auth/2fa/status/',
  TWO_FACTOR_SETUP: '/auth/2fa/setup/',
  TWO_FACTOR_CONFIRM: '/auth/2fa/confirm/',
  TWO_FACTOR_DISABLE: '/auth/2fa/disable/',
  DASHBOARD: '/dashboard/',
  USERS: '/users/',
  USER_DETAIL: (id: number) => `/users/${id}/`,
};

export default API_CONFIG;
