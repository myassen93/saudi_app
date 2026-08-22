import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import AppModal from './AppModal';
import RTLTextInput from './RTLTextInput';
import { useAppDispatch } from '../store/hooks';
import { deleteUser, updateUser } from '../store/slices/usersSlice';
import { Gender, User } from '../types/api.types';
import { colors } from '../theme/colors';
import { borderRadius, fontFamily, fontSize, spacing } from '../theme/spacing';
import { useRTL } from '../utils/rtl';

function BooleanMark({ value }: { value: boolean }) {
  return <FontAwesome5 name={value ? 'check' : 'times'} size={13} color={value ? colors.success : colors.textMuted} />;
}

function genderLabel(t: (k: string) => string, gender: Gender) {
  if (gender === 'male') return t('users.male');
  if (gender === 'female') return t('users.female');
  return t('users.notSet');
}

interface Props {
  user: User;
  onNotify: (title: string, message: string) => void;
}

export default function UserRow({ user, onNotify }: Props) {
  const { t } = useTranslation();
  const { textAlign, rowDir } = useRTL();
  const dispatch = useAppDispatch();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState(user.username);
  const [gender, setGender] = useState<Gender>(user.gender);
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(user.is_staff);
  const [isActive, setIsActive] = useState(user.is_active);

  const resetForm = () => {
    setUsername(user.username);
    setGender(user.gender);
    setPassword('');
    setIsStaff(user.is_staff);
    setIsActive(user.is_active);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload: Record<string, unknown> = { username, gender, is_staff: isStaff, is_active: isActive };
    if (password) payload.password = password;
    const result = await dispatch(updateUser({ id: user.id, payload }));
    setSaving(false);
    if (updateUser.fulfilled.match(result)) {
      setEditing(false);
      onNotify(t('users.updateSuccessTitle'), t('users.updateSuccessMessage', { username: result.payload.username }));
    } else {
      setError(result.payload as string);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    const result = await dispatch(deleteUser(user.id));
    setDeleting(false);
    if (deleteUser.fulfilled.match(result)) {
      onNotify(t('users.deleteSuccessTitle'), t('users.deleteSuccessMessage', { username: user.username }));
    } else {
      onNotify(t('users.errorTitle'), result.payload as string);
    }
  };

  if (editing) {
    return (
      <View style={[styles.row, styles.editingRow]}>
        <RTLTextInput style={styles.input} value={username} onChangeText={setUsername} placeholder={t('users.username')} />

        <View style={[styles.genderPicker, { flexDirection: rowDir }]}>
          {(['', 'male', 'female'] as Gender[]).map((g) => (
            <TouchableOpacity
              key={g || 'unset'}
              style={[styles.genderOption, gender === g && styles.genderOptionActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderOptionText, gender === g && styles.genderOptionTextActive]}>{genderLabel(t, g)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <RTLTextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={t('users.passwordHint')}
          secureTextEntry
        />

        <View style={[styles.switchRow, { flexDirection: rowDir }]}>
          <View style={[styles.switchItem, { flexDirection: rowDir }]}>
            <Text style={styles.switchLabel}>{t('users.staff')}</Text>
            <Switch value={isStaff} onValueChange={setIsStaff} />
          </View>
          <View style={[styles.switchItem, { flexDirection: rowDir }]}>
            <Text style={styles.switchLabel}>{t('users.active')}</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={[styles.editActions, { flexDirection: rowDir }]}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary, { flex: 1 }]}
            onPress={() => { setEditing(false); resetForm(); }}
          >
            <Text style={styles.btnSecondaryText}>{t('actions.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.btnText} /> : <Text style={styles.btnText}>{t('actions.save')}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, { flexDirection: rowDir }]}>
      <View style={styles.info}>
        <Text style={[styles.username, { textAlign }]}>{user.username}</Text>
        <View style={[styles.metaRow, { flexDirection: rowDir }]}>
          <Text style={styles.meta}>{genderLabel(t, user.gender)}</Text>
          <View style={[styles.metaItem, { flexDirection: rowDir }]}>
            <Text style={styles.metaLabel}>{t('users.staff')}</Text>
            <BooleanMark value={user.is_staff} />
          </View>
          <View style={[styles.metaItem, { flexDirection: rowDir }]}>
            <Text style={styles.metaLabel}>{t('users.active')}</Text>
            <BooleanMark value={user.is_active} />
          </View>
        </View>
      </View>

      <View style={[styles.rowActions, { flexDirection: rowDir }]}>
        {deleting ? (
          <ActivityIndicator color={colors.red} />
        ) : (
          <>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setEditing(true)} hitSlop={8}>
              <FontAwesome5 name="pen" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setConfirmDelete(true)} hitSlop={8}>
              <FontAwesome5 name="trash" size={14} color={colors.red} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <AppModal
        visible={confirmDelete}
        title={t('users.confirmDeleteTitle')}
        message={t('users.confirmDeleteMessage', { username: user.username })}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        confirmLabel={t('actions.delete')}
        danger
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editingRow: { flexDirection: 'column', alignItems: 'stretch', gap: spacing.sm, paddingVertical: spacing.md },
  info: { flex: 1 },
  username: { fontSize: fontSize.sm, fontFamily: fontFamily.semibold, color: colors.textPrimary },
  metaRow: { alignItems: 'center', gap: spacing.md, marginTop: 4 },
  meta: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },
  metaItem: { alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textMuted },
  rowActions: { alignItems: 'center', gap: spacing.md },
  iconBtn: { padding: spacing.xs },
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
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  genderOptionActive: { backgroundColor: colors.saudiGreenLight, borderColor: colors.saudiGreen },
  genderOptionText: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },
  genderOptionTextActive: { color: colors.saudiGreenDark, fontFamily: fontFamily.semibold },
  switchRow: { justifyContent: 'space-between' },
  switchItem: { alignItems: 'center', gap: spacing.xs },
  switchLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.regular, color: colors.textSecondary },
  errorText: { color: colors.red, fontSize: fontSize.xs, fontFamily: fontFamily.regular },
  editActions: { gap: spacing.sm },
  btn: { borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.saudiGreen },
  btnSecondary: { backgroundColor: colors.bgSecondary },
  btnText: { color: colors.btnText, fontFamily: fontFamily.semibold, fontSize: fontSize.sm },
  btnSecondaryText: { color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: fontSize.sm },
});
