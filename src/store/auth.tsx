import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppUser } from '@/types';
import { getUserByEmail } from './data';

interface AuthState {
  user: AppUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({ user: null, login: () => false, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('cisto_auth');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('cisto_auth', JSON.stringify(user));
    else localStorage.removeItem('cisto_auth');
  }, [user]);

  const login = (email: string, password: string): boolean => {
    if (email === 'demo@cisto.rs' && password === 'demo1234') {
      const u = getUserByEmail(email);
      if (u && u.active) { setUser(u); return true; }
    }
    return false;
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
