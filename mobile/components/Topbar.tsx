import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, spacing } from '../theme/spacing';
import { useRTL } from '../utils/rtl';

export default function Topbar() {
  const { t } = useTranslation();
  const { rowDir } = useRTL();
  const { language, changeLanguage } = useApp();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <View style={[styles.bar, { flexDirection: rowDir }]}>
      <View style={[styles.brand, { flexDirection: rowDir }]}>
        <Logo size={32} />
        <Text style={styles.title}>{t('appTitle')}</Text>
      </View>

      <View style={[styles.actions, { flexDirection: rowDir }]}>
        {!!user && <Text style={styles.welcome}>{t('auth.welcome', { username: user.username })}</Text>}

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
          hitSlop={8}
        >
          <FontAwesome5 name="globe" size={15} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={() => dispatch(logout())} hitSlop={8}>
          <FontAwesome5 name="sign-out-alt" size={15} color={colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  brand: { alignItems: 'center', gap: spacing.sm },
  title: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  actions: { alignItems: 'center', gap: spacing.md },
  welcome: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },
  iconBtn: { padding: spacing.xs },
});
