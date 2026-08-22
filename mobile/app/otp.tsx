import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from '../components/Logo';
import RTLTextInput from '../components/RTLTextInput';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { cancelOtp, clearAuthError, login } from '../store/slices/authSlice';
import { colors } from '../theme/colors';
import { borderRadius, fontFamily, fontSize, spacing } from '../theme/spacing';
import { useRTL } from '../utils/rtl';

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { textAlign } = useRTL();
  const dispatch = useAppDispatch();
  const { isLoading, error, pendingCredentials, otpRequired } = useAppSelector((s) => s.auth);

  const [code, setCode] = useState('');

  // Reaching this screen requires an in-flight OTP challenge — if the app was
  // restarted or the user deep-linked here directly, there's nothing to verify.
  useEffect(() => {
    if (!otpRequired || !pendingCredentials) {
      router.replace('/login');
    }
  }, [otpRequired, pendingCredentials, router]);

  const errorMessage = useMemo(() => (error ? t(`auth.errors.${error}`) : null), [error, t]);

  const handleVerify = async () => {
    if (!pendingCredentials || code.length !== 6) return;
    dispatch(clearAuthError());
    const result = await dispatch(login({ ...pendingCredentials, otp_token: code }));
    if (login.fulfilled.match(result) && !result.payload.otpRequired) {
      router.replace('/home');
    }
  };

  const handleUseDifferentAccount = () => {
    dispatch(cancelOtp());
    setCode('');
    router.replace('/login');
  };

  if (!pendingCredentials) return null;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Logo size={64} />
        </View>

        <Text style={styles.title}>{t('otp.login.title')}</Text>
        <Text style={styles.subtitle}>{t('otp.login.subtitle')}</Text>
        <Text style={styles.username}>{pendingCredentials.username}</Text>

        {!!errorMessage && (
          <View style={styles.errorBanner}>
            <FontAwesome5 name="exclamation-circle" size={14} color={colors.red} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        <Text style={[styles.label, { textAlign }]}>{t('otp.login.codeLabel')}</Text>
        <RTLTextInput
          style={styles.codeInput}
          value={code}
          onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          autoFocus
          autoComplete="one-time-code"
        />

        <TouchableOpacity
          style={[styles.submitBtn, (code.length !== 6 || isLoading) && styles.submitBtnDisabled]}
          onPress={handleVerify}
          disabled={code.length !== 6 || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? <ActivityIndicator color={colors.btnText} /> : <Text style={styles.submitBtnText}>{t('otp.login.verify')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={handleUseDifferentAccount}>
          <Text style={styles.linkBtnText}>{t('otp.login.useDifferentAccount')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  username: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold, color: colors.saudiGreen, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.redBg,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: { flex: 1, color: colors.red, fontSize: fontSize.xs, fontFamily: fontFamily.regular },
  label: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary, marginBottom: spacing.xs },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    height: 56,
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    letterSpacing: 8,
  },
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
  linkBtn: { alignItems: 'center', marginTop: spacing.lg, padding: spacing.sm },
  linkBtnText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, color: colors.textSecondary, textDecorationLine: 'underline' },
});
