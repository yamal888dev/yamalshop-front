import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { apiFetch, getToken, setToken, clearToken, ApiError } from '@/lib/api';

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** true ระหว่างกำลังเช็ค token ตอนโหลดแอป — ยังไม่รู้ว่าล็อกอินอยู่ไหม */
  initializing: boolean;
  register: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(() => Boolean(getToken()));

  // ตอนโหลดแอป ถ้ามี token อยู่ ให้ดึงข้อมูลผู้ใช้จาก /auth/me
  useEffect(() => {
    if (!getToken()) {
      setInitializing(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const me = await apiFetch<User>('/auth/me');
        if (active) setUser(me);
      } catch {
        clearToken(); // token หมดอายุ/ไม่ถูกต้อง
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleAuth = useCallback(
    async (path: string, payload: unknown): Promise<AuthResult> => {
      try {
        const res = await apiFetch<AuthResponse>(path, { method: 'POST', body: payload });
        setToken(res.accessToken);
        setUser(res.user);
        return { ok: true };
      } catch (err) {
        const error = err instanceof ApiError ? err.message : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้';
        return { ok: false, error };
      }
    },
    [],
  );

  const register = useCallback<AuthContextValue['register']>(
    (input) => handleAuth('/auth/register', input),
    [handleAuth],
  );

  const login = useCallback<AuthContextValue['login']>(
    (email, password) => handleAuth('/auth/login', { email, password }),
    [handleAuth],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      initializing,
      register,
      login,
      logout,
    }),
    [user, initializing, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องใช้ภายใน <AuthProvider>');
  return ctx;
}
