import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import PageLoader from '../components/PageLoader';
import StatsGrid from '../components/StatsGrid';
import Topbar from '../components/Topbar';
import TwoFactorSettingsPanel from '../components/TwoFactorSettingsPanel';
import UsersPanel from '../components/UsersPanel';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { stats, loading } = useAppSelector((s) => s.dashboard);

  // Defensive: a forced logout (401 interceptor) while this screen is mounted
  // should bounce back to login instead of showing a stale dashboard.
  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (!isAuthenticated) return null;

  return (
    <>
      <Topbar />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading && !!stats} onRefresh={() => dispatch(fetchDashboardStats())} />}
      >
        <StatsGrid />
        <TwoFactorSettingsPanel />
        <UsersPanel />
      </ScrollView>
      {loading && !stats && <PageLoader />}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
});
