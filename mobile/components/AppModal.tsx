import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, spacing, borderRadius } from '../theme/spacing';
import { useRTL } from '../utils/rtl';

interface AppModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  /** When provided, renders a Cancel/Confirm pair instead of a single OK button. */
  onConfirm?: () => void;
  confirmLabel?: string;
  /** Confirm button renders in red for destructive actions (delete, disable 2FA). */
  danger?: boolean;
}

/**
 * Shared modal used for delete confirmations, disable-2FA confirmation, and
 * create/update/delete/2FA success-or-error alerts — mirrors the reusable
 * portal-based Modal in saudi_app_react.
 */
export default function AppModal({ visible, title, message, onClose, onConfirm, confirmLabel, danger }: AppModalProps) {
  const { t } = useTranslation();
  const { textAlign } = useRTL();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={[styles.title, { textAlign }]}>{title}</Text>
          <Text style={[styles.message, { textAlign }]}>{message}</Text>

          <View style={styles.actions}>
            {onConfirm ? (
              <>
                <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.btnSecondaryText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, danger ? styles.btnDanger : styles.btnPrimary]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnPrimaryText}>{confirmLabel ?? t('common.ok')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.btnPrimaryText}>{t('common.ok')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: colors.saudiGreen },
  btnDanger: { backgroundColor: colors.red },
  btnSecondary: { backgroundColor: colors.bgSecondary },
  btnPrimaryText: { color: colors.btnText, fontFamily: fontFamily.semibold, fontSize: fontSize.sm },
  btnSecondaryText: { color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: fontSize.sm },
});
