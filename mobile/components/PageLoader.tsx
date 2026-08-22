import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Logo from './Logo';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, spacing } from '../theme/spacing';

/** Full-screen overlay with a pulsing logo, shown during auth/stats/users loads. */
export default function PageLoader() {
  const { t } = useTranslation();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.overlay}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Logo size={64} />
      </Animated.View>
      <Text style={styles.label}>{t('loading')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  label: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
});
