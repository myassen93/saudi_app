import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import { apiClient } from '../../api/client'
import type { TwoFactorSetupResponse } from '../../api/types'

interface SecurityState {
  enabled: boolean
  statusLoading: boolean
}

const initialState: SecurityState = {
  enabled: false,
  statusLoading: false,
}

function extractApiErrorMessage(err: unknown): string {
  if (isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
    const data = err.response.data as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    const messages = Object.entries(data).flatMap(([field, value]) => {
      const text = Array.isArray(value) ? value.join(' ') : String(value)
      return field === 'non_field_errors' ? [text] : [`${field}: ${text}`]
    })
    if (messages.length) return messages.join(' ')
  }
  return 'unexpected_error'
}

export const fetchTwoFactorStatus = createAsyncThunk('security/fetchStatus', async () => {
  const { data } = await apiClient.get<{ enabled: boolean }>('/auth/2fa/status/')
  return data.enabled
})

export const setupTwoFactor = createAsyncThunk<TwoFactorSetupResponse, void, { rejectValue: string }>(
  'security/setup',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ qr_code: string; secret: string }>('/auth/2fa/setup/')
      return { qrDataUri: data.qr_code, secret: data.secret }
    } catch (err) {
      return rejectWithValue(extractApiErrorMessage(err))
    }
  },
)

export const confirmTwoFactor = createAsyncThunk<boolean, string, { rejectValue: string }>(
  'security/confirm',
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ enabled: boolean }>('/auth/2fa/confirm/', { otp_token: code })
      return data.enabled
    } catch (err) {
      return rejectWithValue(extractApiErrorMessage(err))
    }
  },
)

export const disableTwoFactor = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'security/disable',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ enabled: boolean }>('/auth/2fa/disable/')
      return data.enabled
    } catch (err) {
      return rejectWithValue(extractApiErrorMessage(err))
    }
  },
)

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTwoFactorStatus.pending, (state) => {
        state.statusLoading = true
      })
      .addCase(fetchTwoFactorStatus.fulfilled, (state, action) => {
        state.statusLoading = false
        state.enabled = action.payload
      })
      .addCase(fetchTwoFactorStatus.rejected, (state) => {
        state.statusLoading = false
      })
      .addCase(confirmTwoFactor.fulfilled, (state, action) => {
        state.enabled = action.payload
      })
      .addCase(disableTwoFactor.fulfilled, (state, action) => {
        state.enabled = action.payload
      })
  },
})

export default securitySlice.reducer
