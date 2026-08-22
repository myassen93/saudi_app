import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'
import type { DashboardStats } from '../../api/types'

interface DashboardState {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
}

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  const { data } = await apiClient.get<DashboardStats>('/dashboard/')
  return data
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'failed_to_load_stats'
      })
  },
})

export default dashboardSlice.reducer
