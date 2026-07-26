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

// บัญชีผู้ดูแลระบบเริ่มต้น (seed) — สำหรับเข้า Admin Dashboard
const SEED_ADMIN: StoredUser = {
  id: 'u-admin',
  name: 'ผู้ดูแลระบบ',
  email: 'admin@yamal888.com',
  role: 'admin',
  password: 'admin1234',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function loadUsers(): StoredUser[] {
  const users = loadFromStorage<StoredUser[]>(USERS_KEY, []);
  // เติมบัญชี admin ถ้ายังไม่มี
  if (!users.some((u) => u.email === SEED_ADMIN.email)) {
    const seeded = [SEED_ADMIN, ...users];
    saveToStorage(USERS_KEY, seeded);
    return seeded;
  }
  return users;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  users: User[]; // สำหรับหน้าจัดการสมาชิก (ตัด password ออก)
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
  // เก็บสำเนารายชื่อผู้ใช้ไว้ใน state เพื่อให้หน้า admin รีเรนเดอร์เมื่อมีสมาชิกใหม่
  const [users, setUsers] = useState<User[]>(() => loadUsers().map(stripPassword));

  useEffect(() => {
    if (user) saveToStorage(SESSION_KEY, user);
    else removeFromStorage(SESSION_KEY);
  }, [user]);

  const register = useCallback<AuthContextValue['register']>((input) => {
    const email = input.email.trim().toLowerCase();
    const stored = loadUsers();

    if (stored.some((u) => u.email === email)) {
      return { ok: false, error: 'อีเมลนี้ถูกใช้สมัครแล้ว' };
    }

    const newUser: StoredUser = {
      id: `u-${Date.now()}`,
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || undefined,
      role: 'customer',
      password: input.password, // mock เท่านั้น — ระบบจริงต้อง hash ที่ backend
      createdAt: new Date().toISOString(),
    };

    const next = [...stored, newUser];
    saveToStorage(USERS_KEY, next);
    setUsers(next.map(stripPassword));
    setUser(stripPassword(newUser)); // สมัครแล้วเข้าสู่ระบบอัตโนมัติ
    return { ok: true };
  }, []);

  const login = useCallback<AuthContextValue['login']>((email, password) => {
    const normalized = email.trim().toLowerCase();
    const stored = loadUsers();
    const found = stored.find((u) => u.email === normalized);

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
      isAdmin: user?.role === 'admin',
      users,
      register,
      login,
      logout,
    }),
    [user, users, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องใช้ภายใน <AuthProvider>');
  return ctx;
}
