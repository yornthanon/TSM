import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/apiClient';
import { RoleType, User } from '../types';

export interface Identity {
  username: string;
  role: RoleType;
}

type AuthState = { identity: Identity | null; ready: boolean };

const STORAGE_KEY = 'tsm_identity';

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (payload: { username: string; email: string; password: string; phoneNumber?: string; role?: RoleType }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function restoreIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Identity) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restored = restoreIdentity();
    if (restored) {
      setIdentity(restored);
      api.setCurrentUser(restored);
    } else {
      const current = api.getCurrentUser();
      setIdentity({ username: current.username, role: current.role as RoleType });
    }
    setReady(true);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<User> => {
    const res = await api.request<{ accessToken?: string; refreshToken?: string; user?: User }>(
      'POST',
      '/api/public/users/login',
      { username, password }
    );
    if (res.error) throw new Error(res.description || 'Login failed');
    const user = res.data?.user;
    const next: Identity = {
      username: user?.username ?? username,
      role: (user?.role as RoleType) ?? 'ROLE_USER',
    };
    setIdentity(next);
    api.setCurrentUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return user ?? ({ username: next.username, role: next.role } as User);
  }, []);

  const register = useCallback(
    async (payload: { username: string; email: string; password: string; phoneNumber?: string; role?: RoleType }): Promise<User> => {
      const res = await api.request<User>('POST', '/api/public/users/registration', {
        username: payload.username,
        email: payload.email,
        phoneNumber: payload.phoneNumber || '+85512345678',
        password: payload.password,
        role: payload.role || 'ROLE_USER',
      });
      if (res.error) throw new Error(res.description || 'Registration failed');
      const user = res.data;
      await api.request('POST', '/api/public/users/login', {
        username: user.username,
        password: payload.password,
      });
      const next: Identity = { username: user.username, role: user.role };
      setIdentity(next);
      api.setCurrentUser(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return user;
    },
    [api]
  );

  const logout = useCallback(() => {
    setIdentity(null);
    api.setCurrentUser({ username: 'guest', role: 'ROLE_USER' });
    api.setJwtToken('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      identity,
      ready,
      isAuthenticated: !!identity,
      isAdmin: identity?.role === 'ROLE_ADMIN',
      login,
      register,
      logout,
    }),
    [identity, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};