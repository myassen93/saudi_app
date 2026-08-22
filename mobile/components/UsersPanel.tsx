import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import AppModal from './AppModal';
import RTLTextInput from './RTLTextInput';
import UserRow from './UserRow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createUser, fetchUsers } from '../store/slices/usersSlice';
import { Gender } from '../types/api.types';
import { colors } from '../theme/colors';
import { borderRadius, fontFamily, fontSize, spacing } from '../theme/spacing';
import { useRTL } from '../utils/rtl';

type Alert = { title: string; message: string } | null;

export default function UsersPanel() {
  const { t } = useTranslation();
  const { textAlign, rowDir } = useRTL();
  const dispatch = useAppDispatch();
  const { items, loading, forbidden } = useAppSelector((s) => s.users);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newGender, setNewGender] = useState<Gender>('');
  const [newIsStaff, setNewIsStaff] = useState(false);
  const [newIsActive, setNewIsActive] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [alert, setAlert] = useState<Alert>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Staff-only: the API 403s for non-staff callers, and this is the only signal
  // the client has (no role flag on login) — mirrors saudi_app_react's UsersPanel.
  if (forbidden) return null;

  const resetCreateForm = () => {
    setNewUsername('');
    setNewPassword('');
    setNewGender('');
    setNewIsStaff(false);
    setNewIsActive(true);
  };

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    const result = await dispatch(
      createUser({ username: newUsername, password: newPassword, gender: newGender, is_staff: newIsStaff, is_active: newIsActive })
    );
    setCreating(false);
    if (createUser.fulfilled.match(result)) {
      setAlert({ title: t('users.createSuccessTitle'), message: t('users.createSuccessMessage', { username: result.payload.username }) });
      resetCreateForm();
    } else {
      setCreateError(result.payload as string);
    }
  };

  const notify = (title: string, message: string) => setAlert({ title, message });

  return (
    <View style={styles.panel}>
      <View style={[styles.header, { flexDirection: rowDir }]}>
        <FontAwesome5 name="users" size={16} color={colors.saudiGreen} />
        <Text style={[styles.title, { textAlign }]}>{t('users.title')}</Text>
      </View>

      {/* Create form */}
      <View style={styles.createForm}>
        <RTLTextInput
          style={styles.input}
          value={newUsername}
          onChangeText={setNewUsername}
          placeholder={t('users.newUsername')}
          autoCapitalize="none"
        />
        <RTLTextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t('users.newPassword')}
          secureTextEntry
        />
        <View style={[styles.genderPicker, { flexDirection: rowDir }]}>
          {(['', 'male', 'female'] as Gender[]).map((g) => (
            <TouchableOpacity
              key={g || 'unset'}
              style={[styles.genderOption, newGender === g && styles.genderOptionActive]}
              onPress={() => setNewGender(g)}
            >
              <Text style={[styles.genderOptionText, newGender === g && styles.genderOptionTextActive]}>
                {g === 'male' ? t('users.male') : g === 'female' ? t('users.female') : t('users.selectGender')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.switchRow, { flexDirection: rowDir }]}>
          <View style={[styles.switchItem, { flexDirection: rowDir }]}>
            <Text style={styles.switchLabel}>{t('users.staff')}</Text>
            <Switch value={newIsStaff} onValueChange={setNewIsStaff} />
          </View>
          <View style={[styles.switchItem, { flexDirection: rowDir }]}>
            <Text style={styles.switchLabel}>{t('users.active')}</Text>
            <Switch value={newIsActive} onValueChange={setNewIsActive} />
          </View>
        </View>
        {!!createError && <Text style={styles.errorText}>{createError}</Text>}
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, (!newUsername || !newPassword) && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={!newUsername || !newPassword || creating}
        >
          {creating ? <ActivityIndicator color={colors.btnText} /> : (
            <>
              <FontAwesome5 name="user-plus" size={13} color={colors.btnText} style={{ marginEnd: spacing.xs }} />
              <Text style={styles.btnText}>{t('actions.addUser')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.list}>
        {loading && !items.length ? (
          <Text style={styles.note}>{t('loading')}</Text>
        ) : !items.length ? (
          <Text style={styles.note}>{t('users.empty')}</Text>
        ) : (
          items.map((u) => <UserRow key={u.id} user={u} onNotify={notify} />)
        )}
      </View>

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
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  title: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, color: colors.textPrimary },
  createForm: { gap: spacing.sm, marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  genderPicker: { gap: spacing.xs },
  genderOption: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingVertical: spacing.xs, alignItems: 'center' },
  genderOptionActive: { backgroundColor: colors.saudiGreenLight, borderColor: colors.saudiGreen },
  genderOptionText: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },
  genderOptionTextActive: { color: colors.saudiGreenDark, fontFamily: fontFamily.semibold },
  switchRow: { justifyContent: 'space-between' },
  switchItem: { alignItems: 'center', gap: spacing.xs },
  switchLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },
  errorText: { color: colors.red, fontSize: fontSize.xs, fontFamily: fontFamily.regular },
  btn: { flexDirection: 'row', borderRadius: borderRadius.md, paddingVertical: spacing.sm + 2, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.saudiGreen },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.btnText, fontFamily: fontFamily.semibold, fontSize: fontSize.sm },
  list: {},
  note: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
});
