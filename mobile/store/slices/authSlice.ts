import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload } from '../../services/saudiApi';
import { clearAuthTokens, setAuthToken, STORAGE_KEYS } from '../../services/api';
import { Gender } from '../../types/api.types';

export interface AuthUser {
  username: string;
  gender: Gender;
}

// One of the auth.errors.* / otp.login i18n keys — the component looks the
// message up via t(`auth.errors.${error}`), mirroring saudi_app_react's
// status-code -> i18n-key mapping instead of showing raw server text.
export type AuthErrorKey = 'invalid_credentials' | 'network_error' | 'server_error' | 'invalid_otp';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  error: AuthErrorKey | null;
  otpRequired: boolean;
  /** Credentials held only in memory while awaiting the OTP step — never persisted. */
  pendingCredentials: { username: string; password: string } | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoring: true,
  error: null,
  otpRequired: false,
  pendingCredentials: null,
};

type LoginResult =
  | { otpRequired: true }
  | { otpRequired: false; token: string; username: string; gender: Gender };

export const login = createAsyncThunk<LoginResult, LoginPayload, { rejectValue: AuthErrorKey }>(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data);
      await setAuthToken(res.token);
      const user: AuthUser = { username: res.username, gender: res.gender };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return { otpRequired: false, ...res };
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 401 && e.response?.data?.otp_required === true) {
        return { otpRequired: true };
      }
      if (!e.response) return rejectWithValue('network_error');
      if (status === 401) return rejectWithValue('invalid_otp'); // wrong/expired otp_token on resubmit
      if (status === 400) return rejectWithValue('invalid_credentials');
      return rejectWithValue('server_error');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    // best-effort — the token may already be invalid
  } finally {
    await clearAuthTokens();
  }
});

/** Restore a persisted session on app launch. */
export const restoreAuth = createAsyncThunk('auth/restore', async () => {
  const [token, userJson] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
    AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
  ]);
  if (token && userJson) {
    try {
      return { token, user: JSON.parse(userJson) as AuthUser };
    } catch {
      return null;
    }
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    cancelOtp: (state) => {
      state.otpRequired = false;
      state.pendingCredentials = null;
      state.error = null;
    },
    // Used by the 401 response interceptor (services/api.ts) for a forced logout.
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResult, string, { arg: LoginPayload }>) => {
        state.isLoading = false;
        const { payload, meta } = action;
        if (payload.otpRequired) {
          state.otpRequired = true;
          state.pendingCredentials = { username: meta.arg.username, password: meta.arg.password };
        } else {
          state.isAuthenticated = true;
          state.token = payload.token;
          state.user = { username: payload.username, gender: payload.gender };
          state.otpRequired = false;
          state.pendingCredentials = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'server_error';
        // A wrong/expired otp_token during resubmit bumps the user back to plain login,
        // same as saudi_app_react's AuthContext.verifyOtp on a 400.
        if (action.meta.arg.otp_token && action.payload === 'invalid_credentials') {
          state.otpRequired = false;
          state.pendingCredentials = null;
        }
      });

    builder.addCase(logout.fulfilled, () => ({ ...initialState, isRestoring: false }));

    builder.addCase(restoreAuth.fulfilled, (state, { payload }) => {
      state.isRestoring = false;
      if (payload) {
        state.token = payload.token;
        state.user = payload.user;
        state.isAuthenticated = true;
      }
    });
    builder.addCase(restoreAuth.rejected, (state) => {
      state.isRestoring = false;
    });
  },
});

export const { clearAuthError, cancelOtp, resetAuth } = authSlice.actions;
export default authSlice.reducer;
