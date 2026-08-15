'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerAdmin: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Restore authentication state from localStorage
    const savedToken = localStorage.getItem('token');
    const savedAdmin = localStorage.getItem('admin');

    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
    }
    setLoading(false);
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!loading) {
      const isPublicPath = pathname === '/login';
      const hasToken = !!token;

      if (!hasToken && !isPublicPath) {
        router.push('/login');
      } else if (hasToken && isPublicPath) {
        router.push('/');
      }
    }
  }, [token, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Login failed' };
      }

      // Save to state and storage
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));

      router.push('/');
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error connecting to backend' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    router.push('/login');
  };

  const registerAdmin = async (name: string, email: string, password: string) => {
    try {
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const res = await fetch(`${API_URL}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Registration failed' };
      }

      return { success: true, message: data.message || 'Admin registered successfully' };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: 'Network error connecting to backend' };
    }
  };

  const value = {
    token,
    admin,
    loading,
    login,
    logout,
    registerAdmin,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
