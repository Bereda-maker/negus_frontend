'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import authService from '@/services/authService';
import api from '@/services/api';
import { User, AuthContextType } from '@/types';

// --- Constants ---
const TOKEN_KEY = 'negus-gebeya_token';
const USER_KEY = 'negus-gebeya_user';

// --- Helper Functions ---
const persistSession = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  Cookies.remove(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

// --- Context Creation ---
export const AuthContext = createContext<AuthContextType | null>(null);

// --- Provider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();

  // Fetch user function – called on mount and on every route change
  const fetchUser = useCallback(async () => {
    setIsLoading(true);

    // Optimistic restore from localStorage (for quick UI)
    const cachedUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (cachedUser) {
      try { setUser(JSON.parse(cachedUser)); } catch {}
    }

    try {
      const { data } = await authService.getMe();
      setUser(data.user);
      // Keep localStorage in sync
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      // If we didn't have a token but got a user via cookie, we could set a placeholder,
      // but the cookie is HttpOnly, so we can't read it. We'll just rely on the cookie.
      // The interceptor will not add Authorization header if token not in localStorage,
      // but that's okay because the cookie is sent (thanks to withCredentials).
    } catch (error) {
      // Not authenticated – clear stale state
      clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and on path change
  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]); // 👈 re‑fetch every time the route changes

  // --- Login, Register, Logout, etc. (unchanged from your version) ---
  const login = useCallback(
    async (credentials: { email: string; password: string }): Promise<User> => {
      const { token, data } = await authService.login(credentials);
      persistSession(token, data.user);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const register = useCallback(
    async (payload: any): Promise<User> => {
      const { token, data } = await authService.register(payload);
      persistSession(token, data.user);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    clearSession();
    setUser(null);
    toast.success('Logged out.');
  }, []);

  const updateUser = useCallback((partialUser: Partial<User>): void => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...partialUser };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const loginWithToken = useCallback(async (token: string): Promise<User> => {
    localStorage.setItem(TOKEN_KEY, token);
    Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const { data } = await authService.getMe();
      persistSession(token, data.user);
      setUser(data.user);
      return data.user;
    } catch (error) {
      clearSession();
      setUser(null);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    updateUser,
    loginWithToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};