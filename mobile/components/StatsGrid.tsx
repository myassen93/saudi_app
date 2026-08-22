import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { colors } from '../theme/colors';
import { borderRadius, fontFamily, fontSize, spacing } from '../theme/spacing';
import { useRTL } from '../utils/rtl';

export default function StatsGrid() {
  const { t } = useTranslation();
  const { textAlign } = useRTL();
  const { stats, loading } = useAppSelector((s) => s.dashboard);

  const male = stats?.gender_counts.find((g) => g.gender === 'male')?.count ?? 0;
  const female = stats?.gender_counts.find((g) => g.gender === 'female')?.count ?? 0;
  const total = stats?.total_users ?? 0;

  const cards = [
    { key: 'total', label: t('stats.total'), value: total, icon: 'users', tint: colors.saudiGreen },
    { key: 'male', label: t('stats.male'), value: male, icon: 'mars', tint: '#2563EB' },
    { key: 'female', label: t('stats.female'), value: female, icon: 'venus', tint: '#DB2777' },
  ] as const;

  return (
    <View style={styles.grid}>
      {cards.map((c) => (
        <View key={c.key} style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: `${c.tint}1A` }]}>
            <FontAwesome5 name={c.icon} size={16} color={c.tint} solid />
          </View>
          <Text style={styles.value}>{loading ? '—' : c.value}</Text>
          <Text style={[styles.label, { textAlign }]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    flexGrow: 1,
    flexBasis: '30%',
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
