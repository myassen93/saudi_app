import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppModal from './AppModal';
import RTLTextInput from './RTLTextInput';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { confirmTwoFactor, disableTwoFactor, fetchTwoFactorStatus, setupTwoFactor } from '../store/slices/securitySlice';
import { colors } from '../theme/colors';
import { borderRadius, fontFamily, fontSize, spacing } from '../theme/spacing';
import { useRTL } from '../utils/rtl';

type Alert = { title: string; message: string } | null;

export default function TwoFactorSettingsPanel() {
  const { t } = useTranslation();
  const { textAlign, rowDir } = useRTL();
  const dispatch = useAppDispatch();
  const { enabled, statusLoading } = useAppSelector((s) => s.security);

  const [showSetup, setShowSetup] = useState(false);
  const [qrDataUri, setQrDataUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);

  useEffect(() => {
    dispatch(fetchTwoFactorStatus());
  }, [dispatch]);

  const handleEnable = async () => {
    const result = await dispatch(setupTwoFactor());
    if (setupTwoFactor.fulfilled.match(result)) {
      setQrDataUri(result.payload.qrDataUri);
      setSecret(result.payload.secret);
      setShowSetup(true);
      setCode('');
      setConfirmError(null);
    } else {
      setAlert({ title: t('otp.settings.errorTitle'), message: result.payload as string });
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setConfirmError(null);
    const result = await dispatch(confirmTwoFactor(code));
    setConfirming(false);
    if (confirmTwoFactor.fulfilled.match(result)) {
      setShowSetup(false);
      setQrDataUri(null);
      setSecret(null);
      setCode('');
      setAlert({ title: t('otp.settings.enableSuccessTitle'), message: t('otp.settings.enableSuccessMessage') });
    } else {
      setConfirmError(result.payload as string);
    }
  };

  const handleDisable = async () => {
    setShowDisableConfirm(false);
    const result = await dispatch(disableTwoFactor());
    if (disableTwoFactor.fulfilled.match(result)) {
      setAlert({ title: t('otp.settings.disableSuccessTitle'), message: t('otp.settings.disableSuccessMessage') });
    } else {
      setAlert({ title: t('otp.settings.errorTitle'), message: result.payload as string });
    }
  };

  return (
    <View style={styles.panel}>
      <View style={[styles.header, { flexDirection: rowDir }]}>
        <FontAwesome5 name="shield-alt" size={16} color={colors.saudiGreen} />
        <Text style={[styles.title, { textAlign }]}>{t('otp.settings.title')}</Text>
      </View>
      <Text style={[styles.description, { textAlign }]}>{t('otp.settings.description')}</Text>

      <View style={[styles.statusRow, { flexDirection: rowDir }]}>
        <Text style={styles.statusLabel}>
          {statusLoading ? '…' : enabled ? t('otp.settings.statusEnabled') : t('otp.settings.statusDisabled')}
        </Text>
        <View style={[styles.statusDot, enabled ? styles.statusDotOn : styles.statusDotOff]} />
      </View>

      {!showSetup && (
        <TouchableOpacity
          style={[styles.btn, enabled ? styles.btnDanger : styles.btnPrimary]}
          onPress={enabled ? () => setShowDisableConfirm(true) : handleEnable}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>{enabled ? t('otp.settings.disableButton') : t('otp.settings.enableButton')}</Text>
        </TouchableOpacity>
      )}

      {showSetup && qrDataUri && (
        <View style={styles.setupBox}>
          <Text style={[styles.setupTitle, { textAlign }]}>{t('otp.settings.scanTitle')}</Text>
          <Text style={[styles.setupInstructions, { textAlign }]}>{t('otp.settings.scanInstructions')}</Text>
          <View style={styles.qrWrap}>
            <Image source={{ uri: qrDataUri }} style={styles.qrImage} resizeMode="contain" />
          </View>
          <Text style={[styles.manualLabel, { textAlign }]}>{t('otp.settings.manualEntryLabel')}</Text>
          <Text selectable style={styles.secret}>{secret}</Text>

          <Text style={[styles.manualLabel, { textAlign }]}>{t('otp.settings.codeLabel')}</Text>
          <RTLTextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />
          {!!confirmError && <Text style={styles.errorText}>{confirmError}</Text>}

          <View style={[styles.setupActions, { flexDirection: rowDir }]}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary, { flex: 1 }]}
              onPress={() => { setShowSetup(false); setQrDataUri(null); setSecret(null); }}
            >
              <Text style={styles.btnSecondaryText}>{t('otp.settings.cancelButton')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, { flex: 1 }, code.length !== 6 && styles.btnDisabled]}
              onPress={handleConfirm}
              disabled={code.length !== 6 || confirming}
            >
              {confirming ? <ActivityIndicator color={colors.btnText} /> : <Text style={styles.btnText}>{t('otp.settings.confirmButton')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <AppModal
        visible={showDisableConfirm}
        title={t('otp.settings.disableConfirmTitle')}
        message={t('otp.settings.disableConfirmMessage')}
        onClose={() => setShowDisableConfirm(false)}
        onConfirm={handleDisable}
        confirmLabel={t('otp.settings.disableButton')}
        danger
      />
      <AppModal visible={!!alert} title={alert?.title ?? ''} message={alert?.message ?? ''} onClose={() => setAlert(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  title: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, color: colors.textPrimary },
  description: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary, marginBottom: spacing.sm },
  statusRow: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  statusLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, color: colors.textPrimary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotOn: { backgroundColor: colors.success },
  statusDotOff: { backgroundColor: colors.textMuted },
  btn: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: colors.saudiGreen },
  btnDanger: { backgroundColor: colors.red },
  btnSecondary: { backgroundColor: colors.bgSecondary },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.btnText, fontFamily: fontFamily.semibold, fontSize: fontSize.sm },
  btnSecondaryText: { color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: fontSize.sm },
  setupBox: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  setupTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold, color: colors.textPrimary },
  setupInstructions: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary, marginBottom: spacing.sm },
  qrWrap: { alignItems: 'center', marginVertical: spacing.sm },
  qrImage: { width: 180, height: 180, backgroundColor: '#fff', borderRadius: borderRadius.sm },
  manualLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary, marginTop: spacing.sm },
  secret: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    color: colors.saudiGreenDark,
    backgroundColor: colors.saudiGreenLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    letterSpacing: 4,
  },
  errorText: { color: colors.red, fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: spacing.xs },
  setupActions: { gap: spacing.sm, marginTop: spacing.md },
});
