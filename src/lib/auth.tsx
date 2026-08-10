'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const USER_KEY = '__jb_user__';

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

export interface SignupInput {
  fullName: string;
  dob: string;
  gender: string;
  password: string;
  phone: string;
  photoDataUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (phone: string, password: string) => Promise<string | null>;
  signup: (data: SignupInput) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Omit<AuthUser, 'id' | 'email'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function compressPhoto(dataUrl: string, maxDim = 300): Promise<string> {
  return new Promise(resolve => {
    const img = document.createElement('img');
    img.onload = () => {
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function saveUser(u: AuthUser) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch {}
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearUser() {
  try { localStorage.removeItem(USER_KEY); } catch {}
}

interface ServerAuthUser {
  id: string;
  email: string;
  fullName: string;
  dob: string;
  gender: string;
  phone: string;
  photoUrl: string | null;
  languageCertificate: string | null;
}

function serverUserToAuthUser(su: ServerAuthUser): AuthUser {
  return {
    id: su.id,
    email: su.email,
    fullName: su.fullName,
    dob: su.dob,
    gender: su.gender,
    phone: su.phone,
    photoDataUrl: su.photoUrl || undefined,
    languageCertificate: su.languageCertificate
      ? (() => {
          const parts = su.languageCertificate!.split(':');
          return { type: parts[0] || '', score: parts[1] || '' };
        })()
      : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Instant restore from localStorage — no network call, no SDK race conditions
    const stored = loadUser();
    if (stored) setUser(stored);
  }, []);

  async function login(phone: string, password: string): Promise<string | null> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const json = await res.json();
    if (!res.ok) return json.error || "Telefon raqam yoki parol noto'g'ri";

    const authUser = serverUserToAuthUser(json.user);
    if (json.user?.photoUrl) {
      try { localStorage.setItem(`auth_photo_${authUser.id}`, json.user.photoUrl); } catch {}
    }
    const photo = localStorage.getItem(`auth_photo_${authUser.id}`);
    if (photo) authUser.photoDataUrl = photo;

    saveUser(authUser);
    setUser(authUser);
    return null;
  }

  async function signup(data: SignupInput): Promise<string | null> {
    let photoUrl: string | null = null;
    if (data.photoDataUrl) {
      try { photoUrl = await compressPhoto(data.photoDataUrl); }
      catch { photoUrl = data.photoDataUrl; }
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: data.phone,
        password: data.password,
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        photoUrl,
      }),
    });
    const json = await res.json();
    if (!res.ok) return json.error || 'Xatolik yuz berdi';

    if (photoUrl && json.userId) {
      try { localStorage.setItem(`auth_photo_${json.userId}`, photoUrl); } catch {}
    }

    if (json.user) {
      const authUser = serverUserToAuthUser(json.user);
      if (photoUrl) authUser.photoDataUrl = photoUrl;
      saveUser(authUser);
      setUser(authUser);
    }

    return null;
  }

  async function logout(): Promise<void> {
    clearUser();
    setUser(null);
    // Best-effort signOut — don't block on it
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
  }

  async function updateProfile(data: Partial<Omit<AuthUser, 'id' | 'email'>>): Promise<void> {
    if (!user) return;

    await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone,
        languageCertificate: data.languageCertificate,
      }),
    });

    const updated = { ...user, ...data };
    if (data.photoDataUrl !== undefined) {
      try { localStorage.setItem(`auth_photo_${user.id}`, data.photoDataUrl || ''); } catch {}
    }
    saveUser(updated);
    setUser(updated);
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<string | null> {
    if (!user) return 'Foydalanuvchi topilmadi';
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, currentPassword, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) return json.error || 'Xatolik yuz berdi';
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
