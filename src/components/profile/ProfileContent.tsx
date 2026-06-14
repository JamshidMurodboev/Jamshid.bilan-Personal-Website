'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function ProfileContent() {
  const { user, updateProfile, logout } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState('');
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) { router.push(`/${locale}`); return; }
    if (user) {
      setName(user.fullName);
      setDob(user.dob);
      setPhoto(user.photoDataUrl || '');
    }
  }, [user, mounted]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ fullName: name, dob, photoDataUrl: photo || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!mounted || !user) return null;

  const initials = user.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-gray-950 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profil</h1>
        <form onSubmit={save} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <div className="flex justify-center">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-teal-400 hover:opacity-80 transition">
              {photo
                ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 text-2xl font-bold">{initials}</div>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhoto} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">To'liq ism</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tug'ilgan sana</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Email: {user.email}</p>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">
              {saved ? 'Saqlandi ✓' : 'Saqlash'}
            </button>
            <button type="button" onClick={() => { logout(); router.push(`/${locale}`); }}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              Chiqish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
