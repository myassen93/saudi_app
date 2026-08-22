import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Logo from '../components/Logo';
import RTLTextInput from '../components/RTLTextInput';
import { useApp } from '../context/AppContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuthError, login } from '../store/slices/authSlice';
import { colors } from '../theme/colors';
import { borderRadius, fontFamily, fontSize, spacing } from '../theme/spacing';
import { useRTL } from '../utils/rtl';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { textAlign, rowDir } = useRTL();
  const { language, changeLanguage } = useApp();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = useMemo(() => (error ? t(`auth.errors.${error}`) : null), [error, t]);

  const handleSubmit = async () => {
    if (!username || !password) return;
    dispatch(clearAuthError());
    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      if (result.payload.otpRequired) {
        router.push('/otp');
      } else {
        router.replace('/home');
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={[styles.langSwitch, { alignSelf: 'flex-end' }]}
          onPress={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}
        >
          <FontAwesome5 name="globe" size={13} color={colors.textSecondary} />
          <Text style={styles.langSwitchText}>{language === 'ar' ? t('language.en') : t('language.ar')}</Text>
        </TouchableOpacity>

        <View style={styles.logoWrap}>
          <Logo size={72} />
        </View>

        <Text style={styles.title}>{t('appTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.cardSubtitle')}</Text>

        <View style={styles.form}>
          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <FontAwesome5 name="exclamation-circle" size={14} color={colors.red} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          <Text style={[styles.label, { textAlign }]}>{t('auth.username')}</Text>
          <View style={[styles.inputWrap, { flexDirection: rowDir }]}>
            <FontAwesome5 name="user" size={14} color={colors.textMuted} />
            <RTLTextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <Text style={[styles.label, { textAlign }]}>{t('auth.password')}</Text>
          <View style={[styles.inputWrap, { flexDirection: rowDir }]}>
            <FontAwesome5 name="lock" size={14} color={colors.textMuted} />
            <RTLTextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!username || !password || isLoading) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!username || !password || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color={colors.btnText} /> : <Text style={styles.submitBtnText}>{t('auth.signIn')}</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.showcase}>
          {(['point1', 'point2', 'point3'] as const).map((key) => (
            <View key={key} style={[styles.showcaseItem, { flexDirection: rowDir }]}>
              <FontAwesome5 name="check-circle" size={13} color={colors.gold} />
              <Text style={[styles.showcaseText, { textAlign }]}>{t(`auth.showcase.${key}`)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.lg },
  langSwitch: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.xs },
  langSwitchText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  logoWrap: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { gap: spacing.xs },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.redBg,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorBannerText: { flex: 1, color: colors.red, fontSize: fontSize.xs, fontFamily: fontFamily.regular },
  label: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
  inputWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 48,
  },
  input: { flex: 1, fontSize: fontSize.sm, color: colors.textPrimary },
  submitBtn: {
    backgroundColor: colors.saudiGreen,
    borderRadius: borderRadius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: colors.btnText, fontSize: fontSize.md, fontFamily: fontFamily.bold },
  showcase: { marginTop: spacing.xl, gap: spacing.sm },
  showcaseItem: { alignItems: 'center', gap: spacing.sm },
  showcaseText: { flex: 1, fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },
});
