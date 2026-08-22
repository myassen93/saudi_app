import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Language = 'en' | 'ar';

interface AppState {
  language: Language;
  isRTL: boolean;
}

const initialState: AppState = {
  language: 'ar',
  isRTL: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      state.isRTL = action.payload === 'ar';
    },
  },
});

export const { setLanguage } = appSlice.actions;
export default appSlice.reducer;
