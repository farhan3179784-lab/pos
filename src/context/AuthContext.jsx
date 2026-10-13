'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

const STORAGE_KEY = 'pos_admin_session';

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session on initial client load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedSession = localStorage.getItem(STORAGE_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.email) {
            setAdmin(parsed);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to restore admin session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'لاگ ان ناکام رہا۔ (Login failed)');
      }

      const adminData = data.admin || { email, name: 'Admin', role: 'admin' };
      setAdmin(adminData);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
      }

      return { success: true, admin: adminData };
    } catch (err) {
      // Offline fallback: if default credentials match
      if (
        email.trim().toLowerCase() === 'admin@fusion.com' &&
        password.trim() === 'admin123'
      ) {
        const fallbackAdmin = {
          email: 'admin@fusion.com',
          name: 'Super Admin (فیوژن ایڈمن)',
          role: 'admin',
        };
        setAdmin(fallbackAdmin);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackAdmin));
        }
        return { success: true, admin: fallbackAdmin };
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (_) {}

    setAdmin(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
