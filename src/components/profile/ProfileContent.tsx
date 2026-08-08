'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import DateInput from '@/components/shared/DateInput';
import PageNav from '@/components/shared/PageNav';
import { createClient } from '@/lib/supabase/client';

const CERT_TYPES = ['IELTS', 'TOEFL', 'SAT', 'TYS', 'Multilevel', 'Duolingo', 'N/A', 'Other'];

export default function ProfileContent() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('auth');
  const tp = useTranslations('profile');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');
  const [certType, setCertType] = useState('');
  const [certScore, setCertScore] = useState('');
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  type FavItem = { entity_type: string; entity_id: string; label?: string; href?: string };
  const [savedItems, setSavedItems] = useState<FavItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) { router.push(`/${locale}`); return; }
    if (user) {
      setName(user.fullName);
      setDob(user.dob);
      setGender(user.gender || '');
      setPhone(user.phone || '');
      setPhoto(user.photoDataUrl || '');
      if (user.languageCertificate) {
        setCertType(user.languageCertificate.type);
        setCertScore(user.languageCertificate.score);
      }
      setSavedLoading(true);
      const sb = createClient();
      sb.from('user_favorites').select('entity_type,entity_id').eq('user_id', user.id).then(async ({ data }) => {
        if (!data || data.length === 0) { setSavedItems([]); setSavedLoading(false); return; }
        const grouped: Record<string, string[]> = {};
        for (const f of data) {
          if (!grouped[f.entity_type]) grouped[f.entity_type] = [];
          grouped[f.entity_type].push(f.entity_id);
        }
        const items: FavItem[] = [];
        for (const [type, ids] of Object.entries(grouped)) {
          if (type === 'scholarship') {
            const { data: rows } = await sb.from('scholarships').select('id,title,slug').in('id', ids);
            for (const r of rows ?? []) items.push({ entity_type: type, entity_id: r.id, label: r.title, href: `/${locale}/scholarships/${r.slug ?? r.id}` });
          } else if (type === 'university') {
            const { data: rows } = await sb.from('universities').select('id,name,slug').in('id', ids);
            for (const r of rows ?? []) items.push({ entity_type: type, entity_id: r.id, label: r.name, href: `/${locale}/universities/${r.slug ?? r.id}` });
          } else if (type === 'news') {
            const { data: rows } = await sb.from('news_posts').select('id,title_uz,slug').in('id', ids);
            for (const r of rows ?? []) items.push({ entity_type: type, entity_id: r.id, label: r.title_uz, href: `/${locale}/news/${r.slug ?? r.id}` });
          } else if (type === 'result') {
            const { data: rows } = await sb.from('student_results').select('id,student_name,slug').in('id', ids);
            for (const r of rows ?? []) items.push({ entity_type: type, entity_id: r.id, label: r.student_name, href: `/${locale}/results/${r.slug ?? r.id}` });
          } else if (type === 'service') {
            const { data: rows } = await sb.from('services').select('id,name_uz,slug').in('id', ids);
            for (const r of rows ?? []) items.push({ entity_type: type, entity_id: r.id, label: r.name_uz, href: `/${locale}/services/${r.slug ?? r.id}` });
          }
        }
        setSavedItems(items);
        setSavedLoading(false);
      });
    }
  }, [user, mounted, locale, router]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const lc = certType ? { type: certType, score: certScore } : undefined;
    updateProfile({ fullName: name, dob, gender, phone, photoDataUrl: photo || undefined, languageCertificate: lc });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 6) { setPwError("Yangi parol kamida 6 ta belgi bo'lishi kerak"); return; }
    if (newPw !== confirmPw) { setPwError('Parollar mos kelmadi'); return; }
    const err = await changePassword(currentPw, newPw);
    if (err) { setPwError(err); return; }
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2000);
  }

  if (!mounted || !user) return null;

  const initials = user.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12 px-4">
      <div className="max-w-lg mx-auto">
        <PageNav />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('profile')}</h1>

        <form onSubmit={save} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5 mb-6">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('fullName')}</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('dob')}</label>
            <DateInput value={dob} onChange={setDob} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('gender')}</label>
            <select required value={gender} onChange={e => setGender(e.target.value)} className={inputCls}>
              <option value="" disabled>{t('gender')}</option>
              <option value="male">{t('genderMale')}</option>
              <option value="female">{t('genderFemale')}</option>
              <option value="other">{t('genderOther')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('phone')}</label>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tp('certLabel')}</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={certType} onChange={e => { setCertType(e.target.value); if (!e.target.value) setCertScore(''); }} className={inputCls}>
                <option value="">— Tanlang —</option>
                {CERT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {certType && certType !== 'N/A' && (
                <input
                  type="text"
                  placeholder={tp('scorePlaceholder')}
                  value={certScore}
                  onChange={e => setCertScore(e.target.value)}
                  className={`${inputCls} w-28`}
                />
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">Email: {user.email}</p>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">
              {saved ? `${t('saved')} ✓` : t('save')}
            </button>
            <button type="button" onClick={async () => { await logout(); router.push(`/${locale}`); }}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              {t('logout')}
            </button>
          </div>
        </form>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t('savedItems')}</h2>
          {savedLoading ? (
            <p className="text-sm text-gray-400 animate-pulse">Yuklanmoqda...</p>
          ) : savedItems.length === 0 ? (
            <p className="text-sm text-gray-400">Saqlangan elementlar yo&apos;q</p>
          ) : (
            <ul className="space-y-2">
              {savedItems.map(item => (
                <li key={`${item.entity_type}:${item.entity_id}`}>
                  {item.href ? (
                    <Link href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 capitalize flex-shrink-0">{item.entity_type}</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{item.label}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">{item.entity_type}</span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{item.label || item.entity_id}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handlePasswordChange} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{tp('changePassword')}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tp('currentPassword')}</label>
            <input type="password" required value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tp('newPassword')}</label>
            <input type="password" required value={newPw} onChange={e => setNewPw(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tp('confirmPassword')}</label>
            <input type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={inputCls} />
          </div>
          {pwError && <p className="text-sm text-red-600 dark:text-red-400">{pwError}</p>}
          <button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 text-white py-3 rounded-xl font-semibold text-sm transition">
              {pwSaved ? `${tp('passwordSaved')} ✓` : tp('savePassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
