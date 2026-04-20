'use client';

import { useEffect, useState } from 'react';
import { authStore } from '@/store/auth.store';

export function useAuth() {
  const [token, setToken] = useState(authStore.getToken());

  useEffect(() => {
    return authStore.subscribe(setToken);
  }, []);

  return {
    token,
    isAuthenticated: !!token,
    login: authStore.setToken,
    logout: authStore.logout,
  };
}