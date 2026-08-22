import axios from 'axios'

export const AUTH_TOKEN_STORAGE_KEY = 'saudi-app.auth-token'

export const apiClient = axios.create({
  baseURL: '/api',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

export const AUTH_LOGOUT_EVENT = 'saudi-app:auth-logout'

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
    }
    return Promise.reject(error)
  },
)
