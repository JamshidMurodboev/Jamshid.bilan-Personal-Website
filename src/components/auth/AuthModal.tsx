'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/lib/auth';
import DateInput from '@/components/shared/DateInput';
import PhoneInput from '@/components/shared/PhoneInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

type SignupStep = 'form' | 'telegram' | 'otp';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }: Props) {
  const t = useTranslations('auth');
  const { login, signup } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [tab, setTab] = useState(initialTab);
  const [registered, setRegistered] = useState(false);

  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass] = useState('');
  const [siError, setSiError] = useState('');

  const [suName, setSuName] = useState('');
  const [suDob, setSuDob] = useState('');
  const [suGender, setSuGender] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suPhoto, setSuPhoto] = useState('');
  const [suError, setSuError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [signupStep, setSignupStep] = useState<SignupStep>('form');
  const [tgSessionId, setTgSessionId] = useState('');
  const [tgBotLink, setTgBotLink] = useState('');
  const [tgOtp, setTgOtp] = useState('');
  const [tgError, setTgError] = useState('');
  const [tgLoading, setTgLoading] = useState(false);
  const [tgLinked, setTgLinked] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [forgotMode, setForgotMode] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpStep, setFpStep] = useState<'email' | 'telegram' | 'otp' | 'newpw'>('email');
  const [fpSessionId, setFpSessionId] = useState('');
  const [fpBotLink, setFpBotLink] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPw, setFpNewPw] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpLinked, setFpLinked] = useState(false);
  const fpPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setSiError('');
      setSuError('');
      setRegistered(false);
      setSignupStep('form');
      setTgOtp('');
      setTgError('');
      setTgLinked(false);
      setForgotMode(false);
      setFpStep('email');
      setFpOtp('');
      setFpError('');
      setFpLinked(false);
    }
    return () => {
      const p = pollRef.current;
      const fp = fpPollRef.current;
      if (p) clearInterval(p);
      if (fp) clearInterval(fp);
    };
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!registered) return;
    const timer = setTimeout(() => {
      onClose();
      router.push(`/${locale}`);
    }, 2500);
    return () => clearTimeout(timer);
  }, [registered, onClose, router, locale]);

  if (!isOpen) return null;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!siEmail.trim() || !siPass) { setSiError(t('invalidCredentials')); return; }
    try {
      const err = await login(siEmail, siPass);
      if (err) { setSiError(err); return; }
      onClose();
    } catch {
      setSiError(t('error'));
    }
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSuPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSignUpForm(e: React.FormEvent) {
    e.preventDefault();
    if (!suName.trim()) { setSuError(t('nameRequired')); return; }
    if (!suDob) { setSuError(t('dobRequired')); return; }
    if (!suGender) { setSuError(t('genderRequired')); return; }
    if (!suPhone.trim()) { setSuError(t('phoneRequired')); return; }
    if (suPass.length < 6) { setSuError(t('error')); return; }
    setSuError('');
    setTgLoading(true);
    try {
      const res = await fetch('/api/telegram/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'signup', email: suEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setSuError(data.error ? `Telegram sessiyasi yaratishda xato: ${data.error}` : 'Telegram sessiyasi yaratishda xato'); return; }
      setTgSessionId(data.sessionId);
      setTgBotLink(data.botLink);
      setSignupStep('telegram');
      startPolling(data.sessionId, 'signup');
    } catch {
      setSuError('Xatolik yuz berdi');
    } finally {
      setTgLoading(false);
    }
  }

  function startPolling(sessionId: string, type: 'signup' | 'reset') {
    const ref = type === 'signup' ? pollRef : fpPollRef;
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/status?session=${sessionId}`);
        const data = await res.json();
        if (data.status === 'linked') {
          if (ref.current) clearInterval(ref.current);
          if (type === 'signup') { setTgLinked(true); setSignupStep('otp'); }
          else { setFpLinked(true); setFpStep('otp'); }
        }
        if (data.status === 'expired' || data.status === 'not_found') {
          if (ref.current) clearInterval(ref.current);
        }
      } catch {}
    }, 2000);
  }

  async function handleOtpVerify() {
    if (tgOtp.length !== 6) { setTgError("6 raqamli kodni kiriting"); return; }
    setTgLoading(true);
    setTgError('');
    try {
      const res = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: tgSessionId, otp: tgOtp }),
      });
      const data = await res.json();
      if (!res.ok) { setTgError(data.error || "Noto'g'ri kod"); return; }

      const err = await signup({
        fullName: suName,
        dob: suDob,
        gender: suGender,
        email: suEmail,
        password: suPass,
        phone: suPhone,
        photoDataUrl: suPhoto || undefined,
      });
      if (err) { setTgError(err); return; }
      setRegistered(true);
    } catch (e: any) {
      setTgError(`Xatolik: ${e?.message || e}`);
    } finally {
      setTgLoading(false);
    }
  }

  async function handleFpEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!fpEmail.trim()) { setFpError('Email kiriting'); return; }
    setFpLoading(true);
    setFpError('');
    try {
      const res = await fetch('/api/telegram/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'reset', email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error ? `Telegram sessiyasi yaratishda xato: ${data.error}` : 'Telegram sessiyasi yaratishda xato'); return; }
      setFpSessionId(data.sessionId);
      setFpBotLink(data.botLink);
      setFpStep('telegram');
      startPolling(data.sessionId, 'reset');
    } catch {
      setFpError('Xatolik yuz berdi');
    } finally {
      setFpLoading(false);
    }
  }

  async function handleFpOtpVerify() {
    if (fpOtp.length !== 6) { setFpError("6 raqamli kodni kiriting"); return; }
    setFpLoading(true);
    setFpError('');
    try {
      const res = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: fpSessionId, otp: fpOtp }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error || "Noto'g'ri kod"); return; }
      setFpStep('newpw');
    } catch {
      setFpError('Xatolik yuz berdi');
    } finally {
      setFpLoading(false);
    }
  }

  async function handleFpNewPw(e: React.FormEvent) {
    e.preventDefault();
    if (fpNewPw.length < 6) { setFpError(t('passwordMinLength')); return; }
    setFpLoading(true);
    setFpError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, sessionId: fpSessionId, newPassword: fpNewPw }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error || 'Xatolik yuz berdi'); return; }
      setForgotMode(false);
      setSiEmail(fpEmail);
      setTab('signin');
    } catch {
      setFpError('Xatolik yuz berdi');
    } finally {
      setFpLoading(false);
    }
  }

  const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500';
  const errInputCls = 'w-full border border-red-400 dark:border-red-500 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500';

  if (registered) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('saved')} ✓
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('loading')}
          </p>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
            <div className="bg-teal-600 h-1 rounded-full" style={{ width: '100%', transformOrigin: 'left', animation: 'shrink 2.5s linear forwards' }} />
          </div>
        </div>
        <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
      </div>
    );
  }

  if (forgotMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={e => { if (e.target === e.currentTarget) { setForgotMode(false); } }}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
          <button onClick={() => setForgotMode(false)} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{t('resetPassword')}</h2>

          {fpStep === 'email' && (
            <form onSubmit={handleFpEmail} className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Emailingizni kiriting. Telegram orqali tasdiqlash kodi yuboriladi.</p>
              <input type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} className={inputCls} placeholder="email@example.com" />
              {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
              <button type="submit" disabled={fpLoading} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
                {fpLoading ? t('loading') : t('continueBtn')}
              </button>
            </form>
          )}

          {fpStep === 'telegram' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.41l-2.948-.924c-.64-.203-.652-.64.136-.948l11.52-4.44c.534-.194 1.001.13.766.15z"/></svg>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Telegram botimizga o&apos;ting va kod oling</p>
              <a href={fpBotLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.41l-2.948-.924c-.64-.203-.652-.64.136-.948l11.52-4.44c.534-.194 1.001.13.766.15z"/></svg>
                Telegram botini ochish
              </a>
              <div className="space-y-3 pt-2 w-full">
                <p className="text-xs text-gray-400">
                  {fpLinked ? t('linked') : t('enterCodeBelow')}
                </p>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, ''))} className={`${inputCls} text-center text-2xl tracking-widest font-bold`} placeholder="000000" />
                {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
                <button onClick={handleFpOtpVerify} disabled={fpLoading || fpOtp.length !== 6} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
                  {fpLoading ? t('checking') : t('verifyCode')}
                </button>
              </div>
            </div>
          )}

          {fpStep === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Telegramdan kelgan 6 raqamli kodni kiriting</p>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, ''))} className={`${inputCls} text-center text-2xl tracking-widest font-bold`} placeholder="000000" />
              {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
              <button onClick={handleFpOtpVerify} disabled={fpLoading} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
                {fpLoading ? t('checking') : t('confirm')}
              </button>
            </div>
          )}

          {fpStep === 'newpw' && (
            <form onSubmit={handleFpNewPw} className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('confirmed')}</p>
              <input type="password" required minLength={6} value={fpNewPw} onChange={e => setFpNewPw(e.target.value)} className={inputCls} placeholder={t('newPasswordPlaceholder')} />
              {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
              <button type="submit" disabled={fpLoading} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
                {fpLoading ? t('saving') : t('savePassword')}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button onClick={() => setTab('signin')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'signin' ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>{t('signIn')}</button>
          <button onClick={() => setTab('signup')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'signup' ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>{t('signUp')}</button>
        </div>

        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('email')}</label>
              <input type="email" required value={siEmail} onChange={e => setSiEmail(e.target.value)} className={siError ? errInputCls : inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('password')}</label>
              <input type="password" required value={siPass} onChange={e => setSiPass(e.target.value)} className={siError ? errInputCls : inputCls} />
            </div>
            <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">{t('forgotPassword')}</button>
            {siError && <p className="text-red-500 text-sm">{siError}</p>}
            <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">{t('signInBtn')}</button>
          </form>
        )}

        {tab === 'signup' && signupStep === 'form' && (
          <form onSubmit={handleSignUpForm} className="space-y-4">
            <div className="flex justify-center">
              <button type="button" onClick={() => fileRef.current?.click()} className="relative w-20 h-20 rounded-full overflow-hidden bg-teal-100 dark:bg-teal-900 flex items-center justify-center border-2 border-dashed border-teal-400 hover:opacity-80 transition">
                {suPhoto ? <img src={suPhoto} alt="avatar" className="w-full h-full object-cover" /> : (
                  <div className="text-center">
                    <svg className="w-6 h-6 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs text-teal-600 dark:text-teal-400">{t('photo')}</span>
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhoto} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('fullName')} *</label>
              <input type="text" required value={suName} onChange={e => setSuName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('dob')} *</label>
              <DateInput required value={suDob} onChange={setSuDob} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('gender')} *</label>
              <select required value={suGender} onChange={e => setSuGender(e.target.value)} className={inputCls}>
                <option value="" disabled>{t('gender')}</option>
                <option value="male">{t('genderMale')}</option>
                <option value="female">{t('genderFemale')}</option>
                <option value="other">{t('genderOther')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('email')} *</label>
              <input type="email" required value={suEmail} onChange={e => setSuEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('password')} *</label>
              <input type="password" required minLength={6} value={suPass} onChange={e => setSuPass(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('phone')} *</label>
              <PhoneInput required onChange={setSuPhone} />
            </div>
            {suError && <p className="text-red-500 text-sm">{suError}</p>}
            <button type="submit" disabled={tgLoading} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
              {tgLoading ? t('loading') : t('signUpBtn')}
            </button>
          </form>
        )}

        {tab === 'signup' && signupStep === 'telegram' && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.41l-2.948-.924c-.64-.203-.652-.64.136-.948l11.52-4.44c.534-.194 1.001.13.766.15z"/></svg>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-800 dark:text-white mb-1">{t('telegramVerify')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('telegramInstructions')}</p>
            </div>
            <a href={tgBotLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.41l-2.948-.924c-.64-.203-.652-.64.136-.948l11.52-4.44c.534-.194 1.001.13.766.15z"/></svg>
              @jamshidbilanbot ni ochish
            </a>
            <div className="space-y-3 pt-1 w-full">
              <p className="text-xs text-gray-400">
                {tgLinked ? t('linked') : t('enterCodeBelow')}
              </p>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={tgOtp} onChange={e => setTgOtp(e.target.value.replace(/\D/g, ''))} className={`${inputCls} text-center text-2xl tracking-widest font-bold`} placeholder="000000" />
              {tgError && <p className="text-red-500 text-sm">{tgError}</p>}
              <button onClick={handleOtpVerify} disabled={tgLoading || tgOtp.length !== 6} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
                {tgLoading ? t('checking') : t('registerBtn')}
              </button>
            </div>
            <button type="button" onClick={() => setSignupStep('form')} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline">← Orqaga</button>
          </div>
        )}

        {tab === 'signup' && signupStep === 'otp' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Telegramdan kelgan 6 raqamli kodni kiriting</p>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={tgOtp} onChange={e => setTgOtp(e.target.value.replace(/\D/g, ''))} className={`${inputCls} text-center text-2xl tracking-widest font-bold`} placeholder="000000" autoFocus />
            {tgError && <p className="text-red-500 text-sm">{tgError}</p>}
            <button onClick={handleOtpVerify} disabled={tgLoading} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
              {tgLoading ? t('checking') : t('registerBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
