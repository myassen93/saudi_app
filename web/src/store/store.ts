import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './slices/dashboardSlice'
import usersReducer from './slices/usersSlice'
import securityReducer from './slices/securitySlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    users: usersReducer,
    security: securityReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
