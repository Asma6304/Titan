import React, { createContext, useCallback, useContext, useState } from 'react';
import type { Order, UserProfile } from '../types/marketplace';
import { titanApi } from '../services/api';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  recentSessionOrders: Order[];
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: { name: string; email: string; password: string; company?: string }) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (payload: { name: string; company?: string; bio?: string }) => Promise<UserProfile>;
  recordSessionOrder: (order: Order) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Bearer token kept strictly in React memory (never persisted to localStorage)
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [recentSessionOrders, setRecentSessionOrders] = useState<Order[]>([]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await titanApi.login({ email, password });
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; company?: string }) => {
      const result = await titanApi.register(payload);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: { name: string; company?: string; bio?: string }) => {
      if (!token) throw new Error('Please sign in to update your profile.');
      const result = await titanApi.updateProfile(token, payload);
      setUser(result.user);
      return result.user;
    },
    [token]
  );

  const recordSessionOrder = useCallback((order: Order) => {
    setRecentSessionOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        recentSessionOrders,
        login,
        register,
        logout,
        updateProfile,
        recordSessionOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
