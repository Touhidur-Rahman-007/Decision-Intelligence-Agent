'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from './api';
import { UserProfile } from './types';

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem('dia_token');
    if (!stored) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    queueMicrotask(() => setToken(stored));
    apiRequest<UserProfile>('/users/me', { token: stored })
      .then((profile) => setUser(profile))
      .catch(() => {
        window.localStorage.removeItem('dia_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const result = await apiRequest<{
      user: UserProfile;
      accessToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    window.localStorage.setItem('dia_token', result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
  };

  const register = async (username: string, password: string) => {
    const result = await apiRequest<{
      user: UserProfile;
      accessToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    window.localStorage.setItem('dia_token', result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
  };

  const logout = () => {
    window.localStorage.removeItem('dia_token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
