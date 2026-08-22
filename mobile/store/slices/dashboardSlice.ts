import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dashboardApi } from '../../services/saudiApi';
import { DashboardStats } from '../../types/api.types';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  return dashboardApi.stats();
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stats = payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'failed_to_load_stats';
      });
  },
});

export default dashboardSlice.reducer;
