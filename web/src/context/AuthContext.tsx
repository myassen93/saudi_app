import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { apiClient, AUTH_LOGOUT_EVENT, AUTH_TOKEN_STORAGE_KEY } from '../api/client'
import type { Gender, LoginResponse } from '../api/types'

export type LoginErrorReason = 'invalid_credentials' | 'network_error' | 'server_error' | 'invalid_otp'

interface AuthUser {
  username: string
  gender: Gender
}

interface PendingCredentials {
  username: string
  password: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: LoginErrorReason | null
  otpRequired: boolean
  login: (username: string, password: string) => Promise<void>
  verifyOtp: (code: string) => Promise<void>
  cancelOtp: () => void
  logout: () => Promise<void>
}

const USER_STORAGE_KEY = 'saudi-app.auth-user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY))
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<LoginErrorReason | null>(null)
  const [pendingCredentials, setPendingCredentials] = useState<PendingCredentials | null>(null)

  const persistSession = (data: LoginResponse) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ username: data.username, gender: data.gender }))
    setToken(data.token)
    setUser({ username: data.username, gender: data.gender })
  }

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login/', { username, password })
      persistSession(data)
      setPendingCredentials(null)
    } catch (err) {
      // A 401 with otp_required means the password was correct but a 2FA code is
      // needed; a 400 means the credentials themselves were rejected; anything else
      // (no response at all, or a 5xx) means the request never reached that check.
      if (isAxiosError(err) && err.response?.status === 401 && err.response.data?.otp_required) {
        setPendingCredentials({ username, password })
        return
      }
      const reason: LoginErrorReason =
        isAxiosError(err) && err.response
          ? err.response.status === 400
            ? 'invalid_credentials'
            : 'server_error'
          : 'network_error'
      setError(reason)
      throw new Error(reason)
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!pendingCredentials) return
      setLoading(true)
      setError(null)
      try {
        const { data } = await apiClient.post<LoginResponse>('/auth/login/', {
          username: pendingCredentials.username,
          password: pendingCredentials.password,
          otp_token: code,
        })
        persistSession(data)
        setPendingCredentials(null)
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 401) {
          setError('invalid_otp')
          throw new Error('invalid_otp')
        }
        const reason: LoginErrorReason =
          isAxiosError(err) && err.response
            ? err.response.status === 400
              ? 'invalid_credentials'
              : 'server_error'
            : 'network_error'
        setError(reason)
        if (reason === 'invalid_credentials') setPendingCredentials(null)
        throw new Error(reason)
      } finally {
        setLoading(false)
      }
    },
    [pendingCredentials],
  )

  const cancelOtp = useCallback(() => {
    setPendingCredentials(null)
    setError(null)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout/')
    } catch {
      // token may already be invalid/expired server-side; clear local state regardless
    } finally {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
      setToken(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const clearSession = () => {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
      setToken(null)
      setUser(null)
    }
    window.addEventListener(AUTH_LOGOUT_EVENT, clearSession)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, clearSession)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      error,
      otpRequired: pendingCredentials !== null,
      login,
      verifyOtp,
      cancelOtp,
      logout,
    }),
    [user, token, loading, error, pendingCredentials, login, verifyOtp, cancelOtp, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
