'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface LanguageCertificate {
  type: string;
  score: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  photoDataUrl?: string;
  languageCertificate?: LanguageCertificate;
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
  changePassword: (currentPassword: string, newPassword: string) => string | null;
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
        const u: AuthUser = JSON.parse(stored);
        // Reload photo from separate key if not embedded
        if (!u.photoDataUrl) {
          const photo = localStorage.getItem(`auth_photo_${u.id}`);
          if (photo) u.photoDataUrl = photo;
        }
        setUser(u);
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
      // Reload photo from separate key
      if (!u.photoDataUrl) {
        const photo = localStorage.getItem(`auth_photo_${u.id}`);
        if (photo) u.photoDataUrl = photo;
      }
      setUser(u);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setSessionCookie();
      // Sync login to Supabase site_users (best-effort)
      createClient().from('site_users').update({ last_active_at: new Date().toISOString(), login_count: (found as any).login_count + 1 }).eq('id', u.id).then(() => {});
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
      // Store photo separately to avoid localStorage quota issues with large base64 images
      if (data.photoDataUrl) {
        try { localStorage.setItem(`auth_photo_${newUser.id}`, data.photoDataUrl); } catch { newUser.photoDataUrl = undefined; }
      }
      const userForStorage = { ...newUser, photoDataUrl: undefined, password: data.password };
      users.push(userForStorage as StoredUser);
      localStorage.setItem('auth_users', JSON.stringify(users));
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      setSessionCookie();
      // Sync new user to Supabase site_users (best-effort)
      createClient().from('site_users').upsert({
        id: newUser.id,
        full_name: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        dob: newUser.dob,
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        login_count: 1,
        status: 'active',
      }, { onConflict: 'id' }).then(() => {});
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
    // Sync language certificate to Supabase
    if (data.languageCertificate !== undefined) {
      createClient().from('site_users').update({
        language_certificate: data.languageCertificate ? `${data.languageCertificate.type}:${data.languageCertificate.score}` : null,
      }).eq('id', user.id).then(() => {});
    }
  }

  function changePassword(currentPassword: string, newPassword: string): string | null {
    if (!user) return 'Foydalanuvchi topilmadi';
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const idx = users.findIndex(u => u.id === user.id);
      if (idx < 0 || users[idx].password !== currentPassword) return "Joriy parol noto'g'ri";
      users[idx].password = newPassword;
      localStorage.setItem('auth_users', JSON.stringify(users));
      return null;
    } catch { return 'Xatolik yuz berdi'; }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, changePassword }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
