import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import API_CONFIG from '../config/api.config';
import i18n from '../config/i18n';

// Storage keys (AsyncStorage — matches the convention used across this
// developer's other Expo apps, e.g. trophyApp/services/api.ts)
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch {}
};

export const clearAuthTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
  } catch {}
};

// ─── Axios instance ───────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach the DRF token + current language ───────────

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    // DRF TokenAuthentication convention — the scheme word is "Token", not "Bearer".
    if (token) config.headers.Authorization = `Token ${token}`;

    // Django's LocaleMiddleware picks up Accept-Language for translated error strings.
    config.headers['Accept-Language'] = i18n.language === 'en' ? 'en' : 'ar';

    if (API_CONFIG.ENABLE_LOGGING) {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: forced logout on 401 ──────────────────────────────
//
// Mirrors saudi_app_react's axios interceptor: any 401 clears the session.
// This also fires during the OTP-required 401 returned by POST /auth/login/,
// but since there's no session yet at that point (no token stored), clearing
// an already-empty session is a harmless no-op — same reasoning as the web app.

apiClient.interceptors.response.use(
  (response) => {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthTokens();
      const { store } = await import('../store');
      const { resetAuth } = await import('../store/slices/authSlice');
      store.dispatch(resetAuth());
    }

    if (API_CONFIG.ENABLE_LOGGING) {
      if (error.response) {
        console.warn('API Error:', error.response.status, error.config?.url, JSON.stringify(error.response.data));
      } else {
        console.warn('Network Error:', error.message, error.config?.url);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Generic API methods ─────────────────────────────────────────────────────

export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete<T>(url, config),
};

export default apiClient;
