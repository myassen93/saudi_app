import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import Restart from 'react-native-restart';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Language, setLanguage } from '../store/slices/appSlice';

export const LANGUAGE_KEY = '@app_language';

interface AppContextType {
  language: Language;
  isRTL: boolean;
  changeLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { language, isRTL } = useAppSelector((state) => state.app);
  const { i18n } = useTranslation();

  const changeLanguage = (lang: Language) => {
    if (lang === language) return;
    void (async () => {
      dispatch(setLanguage(lang));
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => {});

      const isRTLLang = lang === 'ar';
      const directionChanged = I18nManager.isRTL !== isRTLLang;
      if (directionChanged) {
        I18nManager.forceRTL(isRTLLang);
        // RTL mirroring only takes effect after a true native restart — the
        // JS-only reload from Fast Refresh/DevSettings leaves it wrong.
        Restart.restart();
      }
    })();
  };

  const value: AppContextType = useMemo(
    () => ({ language, isRTL, changeLanguage }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, isRTL]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
