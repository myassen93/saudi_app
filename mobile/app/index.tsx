import { Redirect } from 'expo-router';
import React from 'react';
import { useAppSelector } from '../store/hooks';

export default function Index() {
  const { isAuthenticated, isRestoring } = useAppSelector((s) => s.auth);

  if (isRestoring) return null;
  return <Redirect href={isAuthenticated ? '/home' : '/login'} />;
}
