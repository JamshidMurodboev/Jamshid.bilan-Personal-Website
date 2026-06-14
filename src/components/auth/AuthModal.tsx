'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }: Props) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass] = useState('');
  const [siError, setSiError] = useState('');
  const [suName, setSuName] = useState('');
  const [suDob, setSuDob] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suPhoto, setSuPhoto] = useState('');
  const [suError, setSuError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isOpen) setTab(initialTab); }, [initialTab, isOpen]);

  if (!isOpen) return null;

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const err = login(siEmail, siPass);
    if (err) { setSiError(err); return; }
    onClose();
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!suName.trim()) { setSuError('Ism kiritilmagan'); return; }
    if (!suDob) { setSuError("Tug'ilgan sana kiritilmagan"); return; }
    const err = signup(suName, suDob, suEmail, suPass, suPhoto || undefined);
    if (err) { setSuError(err); return; }
    onClose();
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSuPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button onClick={() => setTab('signin')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'signin' ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Kirish</button>
          <button onClick={() => setTab('signup')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'signup' ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Ro'yxatdan o'tish</button>
        </div>
        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
              <input type="email" required value={siEmail} onChange={e => setSiEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Parol</label>
              <input type="password" required value={siPass} onChange={e => setSiPass(e.target.value)} className={inputCls} />
            </div>
            <button type="button" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">Parolni unutdingizmi?</button>
            {siError && <p className="text-red-500 text-sm">{siError}</p>}
            <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">Kirish</button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex justify-center">
              <button type="button" onClick={() => fileRef.current?.click()} className="relative w-20 h-20 rounded-full overflow-hidden bg-teal-100 dark:bg-teal-900 flex items-center justify-center border-2 border-dashed border-teal-400 hover:opacity-80 transition">
                {suPhoto ? <img src={suPhoto} alt="avatar" className="w-full h-full object-cover" /> : (
                  <div className="text-center">
                    <svg className="w-6 h-6 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs text-teal-600 dark:text-teal-400">Rasm</span>
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhoto} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">To'liq ism *</label>
              <input type="text" required value={suName} onChange={e => setSuName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tug'ilgan sana *</label>
              <input type="date" required value={suDob} onChange={e => setSuDob(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email *</label>
              <input type="email" required value={suEmail} onChange={e => setSuEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Parol *</label>
              <input type="password" required minLength={6} value={suPass} onChange={e => setSuPass(e.target.value)} className={inputCls} />
            </div>
            {suError && <p className="text-red-500 text-sm">{suError}</p>}
            <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">Ro'yxatdan o'tish</button>
          </form>
        )}
      </div>
    </div>
  );
}
