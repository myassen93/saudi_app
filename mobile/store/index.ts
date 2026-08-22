import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import securityReducer from './slices/securitySlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
    security: securityReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
