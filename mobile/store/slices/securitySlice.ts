import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { securityApi } from '../../services/saudiApi';
import { getErrorMessage } from '../../utils/apiHelpers';

interface SecurityState {
  enabled: boolean;
  statusLoading: boolean;
}

const initialState: SecurityState = {
  enabled: false,
  statusLoading: false,
};

export const fetchTwoFactorStatus = createAsyncThunk('security/fetchStatus', async () => {
  const res = await securityApi.status();
  return res.enabled;
});

export const setupTwoFactor = createAsyncThunk<
  { qrDataUri: string; secret: string },
  void,
  { rejectValue: string }
>('security/setup', async (_, { rejectWithValue }) => {
  try {
    const res = await securityApi.setup();
    return { qrDataUri: res.qr_code, secret: res.secret };
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const confirmTwoFactor = createAsyncThunk<boolean, string, { rejectValue: string }>(
  'security/confirm',
  async (code, { rejectWithValue }) => {
    try {
      const res = await securityApi.confirm(code);
      return res.enabled;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const disableTwoFactor = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'security/disable',
  async (_, { rejectWithValue }) => {
    try {
      const res = await securityApi.disable();
      return res.enabled;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTwoFactorStatus.pending, (state) => {
        state.statusLoading = true;
      })
      .addCase(fetchTwoFactorStatus.fulfilled, (state, { payload }) => {
        state.statusLoading = false;
        state.enabled = payload;
      })
      .addCase(fetchTwoFactorStatus.rejected, (state) => {
        state.statusLoading = false;
      });

    builder.addCase(confirmTwoFactor.fulfilled, (state, { payload }) => {
      state.enabled = payload;
    });
    builder.addCase(disableTwoFactor.fulfilled, (state, { payload }) => {
      state.enabled = payload;
    });
  },
});

export default securitySlice.reducer;
