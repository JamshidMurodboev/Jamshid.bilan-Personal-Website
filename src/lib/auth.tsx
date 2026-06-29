'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  photoDataUrl?: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

export interface SignupInput {
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  password: string;
  phone: string;
  photoDataUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => string | null;
  signup: (data: SignupInput) => string | null;
  logout: () => void;
  updateProfile: (data: Partial<Omit<AuthUser, 'id' | 'email'>>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function setSessionCookie() {
  document.cookie = 'auth_session=1; path=/; max-age=604800; SameSite=Lax';
}

function clearSessionCookie() {
  document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setSessionCookie();
      }
    } catch {}
  }, []);

  function login(email: string, password: string): string | null {
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) return "Email yoki parol noto'g'ri";
      const { password: _, ...u } = found;
      setUser(u);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setSessionCookie();
      return null;
    } catch { return 'Xatolik yuz berdi'; }
  }

  function signup(data: SignupInput): string | null {
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem('auth_users') || '[]');
      if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) return "Bu email allaqachon ro'yxatdan o'tgan";
      const newUser: AuthUser = {
        id: Date.now().toString(),
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        photoDataUrl: data.photoDataUrl,
      };
      users.push({ ...newUser, password: data.password });
      localStorage.setItem('auth_users', JSON.stringify(users));
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      setSessionCookie();
      return null;
    } catch { return 'Xatolik yuz berdi'; }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('auth_user');
    clearSessionCookie();
  }

  function updateProfile(data: Partial<Omit<AuthUser, 'id' | 'email'>>) {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('auth_user', JSON.stringify(updated));
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) users[idx] = { ...users[idx], ...data };
      localStorage.setItem('auth_users', JSON.stringify(users));
    } catch {}
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
