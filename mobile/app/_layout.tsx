import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { getLocales } from 'expo-localization';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { I18nManager, Text, TextInput, View } from 'react-native';
import Restart from 'react-native-restart';
import { Provider } from 'react-redux';
import i18n from '../config/i18n';
import { AppProvider, LANGUAGE_KEY } from '../context/AppContext';
import { store } from '../store';
import { Language, setLanguage } from '../store/slices/appSlice';
import { restoreAuth } from '../store/slices/authSlice';
import { colors } from '../theme/colors';

// Keep the native splash on screen until initialization finishes.
SplashScreen.preventAutoHideAsync().catch(() => {});

const RTL_RESTART_FLAG = '@rtl_reload_done';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansArabic_400Regular: require('../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
    IBMPlexSansArabic_500Medium: require('../assets/fonts/IBMPlexSansArabic-Medium.ttf'),
    IBMPlexSansArabic_600SemiBold: require('../assets/fonts/IBMPlexSansArabic-SemiBold.ttf'),
    IBMPlexSansArabic_700Bold: require('../assets/fonts/IBMPlexSansArabic-Bold.ttf'),
  });

  // Apply IBM Plex Sans Arabic globally once loaded — it covers both Arabic
  // and Latin glyphs cleanly, so one family suffices app-wide.
  useEffect(() => {
    if (!fontsLoaded) return;
    if (!(Text as any).defaultProps) (Text as any).defaultProps = {};
    (Text as any).defaultProps.style = { fontFamily: 'IBMPlexSansArabic_400Regular' };
    if (!(TextInput as any).defaultProps) (TextInput as any).defaultProps = {};
    (TextInput as any).defaultProps.style = { fontFamily: 'IBMPlexSansArabic_400Regular' };
  }, [fontsLoaded]);

  const [appReady, setAppReady] = useState(false);
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    async function prepare() {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        let activeLang: Language;
        if (savedLang === 'ar' || savedLang === 'en') {
          activeLang = savedLang;
        } else {
          const deviceLocale = getLocales()[0]?.languageCode ?? 'ar';
          activeLang = deviceLocale === 'en' ? 'en' : 'ar';
        }
        store.dispatch(setLanguage(activeLang));
        await i18n.changeLanguage(activeLang);

        const shouldBeRTL = activeLang === 'ar';
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.forceRTL(shouldBeRTL);
          // RTL mirroring only takes effect after a true native restart. Guard
          // against a restart loop in case the native flag doesn't persist.
          const alreadyRestarted = await AsyncStorage.getItem(RTL_RESTART_FLAG);
          if (!alreadyRestarted) {
            await AsyncStorage.setItem(RTL_RESTART_FLAG, 'true');
            Restart.restart();
            return;
          }
        } else {
          await AsyncStorage.removeItem(RTL_RESTART_FLAG).catch(() => {});
        }

        await store.dispatch(restoreAuth());
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const hideSplash = React.useCallback(() => {
    if (appReady) SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  if (!appReady) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Provider store={store}>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
        </AppProvider>
      </Provider>
    </View>
  );
}
