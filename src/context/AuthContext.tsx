import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { StoredUser, User } from '@/types';
import { loadFromStorage, saveToStorage, removeFromStorage } from '@/utils/storage';

const USERS_KEY = 'yamal888:users'; // รายชื่อผู้ใช้ที่สมัครไว้ (mock DB)
const SESSION_KEY = 'yamal888:session'; // ผู้ใช้ที่ล็อกอินอยู่

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  register: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => AuthResult;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function stripPassword(u: StoredUser): User {
  const { password: _pw, ...rest } = u;
  void _pw;
  return rest;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    loadFromStorage<User | null>(SESSION_KEY, null),
  );

  useEffect(() => {
    if (user) saveToStorage(SESSION_KEY, user);
    else removeFromStorage(SESSION_KEY);
  }, [user]);

  const register = useCallback<AuthContextValue['register']>((input) => {
    const email = input.email.trim().toLowerCase();
    const users = loadFromStorage<StoredUser[]>(USERS_KEY, []);

    if (users.some((u) => u.email === email)) {
      return { ok: false, error: 'อีเมลนี้ถูกใช้สมัครแล้ว' };
    }

    const newUser: StoredUser = {
      id: `u-${Date.now()}`,
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || undefined,
      password: input.password, // mock เท่านั้น — ระบบจริงต้อง hash ที่ backend
      createdAt: new Date().toISOString(),
    };

    saveToStorage(USERS_KEY, [...users, newUser]);
    setUser(stripPassword(newUser)); // สมัครแล้วเข้าสู่ระบบอัตโนมัติ
    return { ok: true };
  }, []);

  const login = useCallback<AuthContextValue['login']>((email, password) => {
    const normalized = email.trim().toLowerCase();
    const users = loadFromStorage<StoredUser[]>(USERS_KEY, []);
    const found = users.find((u) => u.email === normalized);

    if (!found || found.password !== password) {
      return { ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }

    setUser(stripPassword(found));
    return { ok: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      register,
      login,
      logout,
    }),
    [user, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องใช้ภายใน <AuthProvider>');
  return ctx;
}
