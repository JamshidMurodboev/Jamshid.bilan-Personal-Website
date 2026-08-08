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
  login: (email: string, password: string) => Promise<string | null>;
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

function rowToAuthUser(row: Record<string, unknown>, id: string, email: string): AuthUser {
  return {
    id,
    email,
    fullName: (row.full_name as string) || '',
    dob: (row.dob as string) || '',
    gender: (row.gender as string) || '',
    phone: (row.phone as string) || '',
    languageCertificate: row.language_certificate
      ? (() => {
          const parts = (row.language_certificate as string).split(':');
          return { type: parts[0] || '', score: parts[1] || '' };
        })()
      : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Load initial session
    supabase.auth.getUser().then(async ({ data: { user: sbUser } }) => {
      if (sbUser) {
        const { data: profile } = await supabase
          .from('site_users')
          .select('*')
          .eq('id', sbUser.id)
          .single();
        const authUser = profile
          ? rowToAuthUser(profile as Record<string, unknown>, sbUser.id, sbUser.email || '')
          : {
              id: sbUser.id,
              email: sbUser.email || '',
              fullName: '',
              dob: '',
              gender: '',
              phone: '',
            };
        // Load photo from localStorage
        const photo = localStorage.getItem(`auth_photo_${sbUser.id}`);
        if (photo) authUser.photoDataUrl = photo;
        setUser(authUser);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('site_users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        const authUser = profile
          ? rowToAuthUser(profile as Record<string, unknown>, session.user.id, session.user.email || '')
          : {
              id: session.user.id,
              email: session.user.email || '',
              fullName: '',
              dob: '',
              gender: '',
              phone: '',
            };
        const photo = localStorage.getItem(`auth_photo_${session.user.id}`);
        if (photo) authUser.photoDataUrl = photo;
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<string | null> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message.includes('confirmed') ? "Email tasdiqlanmagan — parolni tiklashni urinib ko'ring" : "Email yoki parol noto'g'ri";
    // Ensure site_users row exists for accounts created outside the new signup flow
    if (data.user) {
      const { data: existing } = await supabase.from('site_users').select('id').eq('id', data.user.id).single();
      if (!existing) {
        await supabase.from('site_users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: '',
          created_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
          login_count: 1,
          status: 'active',
        });
      }
    }
    return null;
  }

  async function signup(data: SignupInput): Promise<string | null> {
    let photoUrl: string | null = null;
    if (data.photoDataUrl) {
      try {
        photoUrl = await compressPhoto(data.photoDataUrl);
      } catch {
        photoUrl = data.photoDataUrl;
      }
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone,
        photoUrl,
      }),
    });
    const json = await res.json();
    if (!res.ok) return json.error || 'Xatolik yuz berdi';

    // Cache photo locally for instant display
    if (photoUrl && json.userId) {
      try { localStorage.setItem(`auth_photo_${json.userId}`, photoUrl); } catch {}
    }

    // Sign in immediately after admin-created account
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (signInError) return `Xatolik: ${signInError.message}`;

    return null;
  }

  async function logout(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  async function updateProfile(data: Partial<Omit<AuthUser, 'id' | 'email'>>): Promise<void> {
    if (!user) return;
    const supabase = createClient();

    const updates: Record<string, unknown> = {};
    if (data.fullName !== undefined) updates.full_name = data.fullName;
    if (data.dob !== undefined) updates.dob = data.dob;
    if (data.gender !== undefined) updates.gender = data.gender;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.languageCertificate !== undefined) {
      updates.language_certificate = data.languageCertificate
        ? `${data.languageCertificate.type}:${data.languageCertificate.score}`
        : null;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('site_users').update(updates).eq('id', user.id);
    }

    const updated = { ...user, ...data };
    if (data.photoDataUrl !== undefined) {
      try { localStorage.setItem(`auth_photo_${user.id}`, data.photoDataUrl || ''); } catch {}
    }
    setUser(updated);
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<string | null> {
    if (!user) return 'Foydalanuvchi topilmadi';
    const supabase = createClient();
    // Re-authenticate to verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) return "Joriy parol noto'g'ri";
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return 'Xatolik yuz berdi';
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
