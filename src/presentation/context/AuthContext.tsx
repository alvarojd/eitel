'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@/core/entities/User';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { logoutAction } from '@/infrastructure/actions/authActions';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    router.push('/');
  }, [router]);

  const logout = useCallback(async () => {
    setUser(null);
    await logoutAction();
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isLoading
  }), [user, login, logout, isAuthenticated, isAdmin, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
