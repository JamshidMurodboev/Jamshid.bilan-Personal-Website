'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/lib/auth';
import DateInput from '@/components/shared/DateInput';

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

  // Sign in state
  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass] = useState('');
  const [siError, setSiError] = useState('');

  // Sign up state
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suDob, setSuDob] = useState('');
  const [suGender, setSuGender] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suError, setSuError] = useState('');
  const [signupStep, setSignupStep] = useState<SignupStep>('form');

  // Telegram OTP state
  const [tgSessionId, setTgSessionId] = useState('');
  const [tgLinked, setTgLinked] = useState(false);
  const [tgOtp, setTgOtp] = useState('');
  const [tgError, setTgError] = useState('');
  const [tgLoading, setTgLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Forgot password state
  const [fpStep, setFpStep] = useState<'email' | 'telegram' | 'otp' | 'reset'>('email');
  const [fpEmail, setFpEmail] = useState('');
  const [fpSessionId, setFpSessionId] = useState('');
  const [fpLinked, setFpLinked] = useState(false);
  const [fpOtp, setFpOtp] = useState('');
  const [fpToken, setFpToken] = useState('');
  const [fpNewPw, setFpNewPw] = useState('');
  const [fpConfirmPw, setFpConfirmPw] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSaved, setFpSaved] = useState(false);
  const fpPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (fpPollRef.current) clearInterval(fpPollRef.current);
    };
  }, []);

  function startPolling(sessionId: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/status?session_id=${sessionId}`);
        const data = await res.json();
        if (data.status === 'linked' || data.status === 'verified') {
          setTgLinked(true);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {}
    }, 2000);
  }

  function startFpPolling(sessionId: string) {
    if (fpPollRef.current) clearInterval(fpPollRef.current);
    fpPollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/status?session_id=${sessionId}`);
        const data = await res.json();
        if (data.status === 'linked' || data.status === 'verified') {
          setFpLinked(true);
          if (fpPollRef.current) clearInterval(fpPollRef.current);
        }
      } catch {}
    }, 2000);
  }

  if (!isOpen) return null;

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!siEmail.trim() || !siPass) { setSiError(t('invalidCredentials')); return; }
    if (!login) return;
    login(siEmail, siPass).then(err => {
      if (err) { setSiError(t('invalidCredentials')); return; }
      onClose();
    });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSuError('');
    if (!suName.trim() || !suEmail.trim() || !suPass || !suDob || !suGender || !suPhone.trim()) {
      setSuError(t('fillAllFields'));
      return;
    }
    // Init telegram session
    try {
      const res = await fetch('/api/telegram/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: suEmail }),
      });
      const data = await res.json();
      if (!data.session_id) { setSuError('Telegram sessiyasi yaratishda xato'); return; }
      setTgSessionId(data.session_id);
      setSignupStep('telegram');
      startPolling(data.session_id);
    } catch {
      setSuError('Server bilan bog\'lanishda xato');
    }
  }

  async function handleOtpVerify() {
    if (tgOtp.length !== 6) return;
    setTgLoading(true);
    setTgError('');
    try {
      // Verify OTP
      const verifyRes = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: tgSessionId, otp: tgOtp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.ok) { setTgError(verifyData.error || 'Kod noto\'g\'ri'); setTgLoading(false); return; }

      // Complete signup
      if (!signup) { setTgError('Signup not available'); setTgLoading(false); return; }
      const err = await signup({
        email: suEmail,
        password: suPass,
        fullName: suName,
        dob: suDob,
        gender: suGender,
        phone: suPhone,
      });
      if (err) { setTgError(err); setTgLoading(false); return; }
      setRegistered(true);
      setSignupStep('form');
      setTab('signin');
    } catch {
      setTgError('Xato yuz berdi');
    }
    setTgLoading(false);
  }

  async function handleFpEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFpError('');
    if (!fpEmail.trim()) { setFpError('Email kiriting'); return; }
    setFpLoading(true);
    try {
      const res = await fetch('/api/telegram/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (!data.session_id) { setFpError(data.error || 'Xato'); setFpLoading(false); return; }
      setFpSessionId(data.session_id);
      setFpStep('telegram');
      startFpPolling(data.session_id);
    } catch {
      setFpError('Server bilan bog\'lanishda xato');
    }
    setFpLoading(false);
  }

  async function handleFpOtpVerify() {
    if (fpOtp.length !== 6) return;
    setFpLoading(true);
    setFpError('');
    try {
      const res = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: fpSessionId, otp: fpOtp }),
      });
      const data = await res.json();
      if (!data.ok) { setFpError(data.error || 'Kod noto\'g\'ri'); setFpLoading(false); return; }
      setFpToken(data.reset_token || fpOtp);
      setFpStep('reset');
    } catch {
      setFpError('Xato yuz berdi');
    }
    setFpLoading(false);
  }

  async function handleFpReset(e: React.FormEvent) {
    e.preventDefault();
    setFpError('');
    if (fpNewPw.length < 6) { setFpError('Parol kamida 6 ta belgi'); return; }
    if (fpNewPw !== fpConfirmPw) { setFpError('Parollar mos kelmadi'); return; }
    setFpLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, token: fpToken, new_password: fpNewPw }),
      });
      const data = await res.json();
      if (!data.ok) { setFpError(data.error || 'Xato'); setFpLoading(false); return; }
      setFpSaved(true);
      setTimeout(() => {
        setShowForgot(false);
        setFpStep('email');
        setFpEmail('');
        setFpOtp('');
        setFpNewPw('');
        setFpConfirmPw('');
        setFpSaved(false);
      }, 2000);
    } catch {
      setFpError('Xato yuz berdi');
    }
    setFpLoading(false);
  }

  const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400';

  // --- FORGOT PASSWORD FLOW ---
  if (showForgot) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-0 sm:pb-4" onClick={e => { if (e.target === e.currentTarget) { setShowForgot(false); } }}>
        <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overscroll-contain touch-pan-y" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Parolni tiklash</h2>
              <button onClick={() => setShowForgot(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            {fpStep === 'email' && (
              <form onSubmit={handleFpEmailSubmit} className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Email manzilingizni kiriting. Telegram orqali tasdiqlash kodi yuboriladi.</p>
                <input type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="Email" className={inputCls} />
                {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
                <button type="submit" disabled={fpLoading} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
                  {fpLoading ? 'Yuklanmoqda...' : 'Davom etish'}
                </button>
              </form>
            )}

            {fpStep === 'telegram' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {fpLinked ? '✅ Ulandi!' : "⏳ Botga o'tib \"Start\" ni bosing, keyin kodni quyida kiriting:"}
                </p>
                <a
                  href={`https://t.me/JamshidBilanBot?start=${fpSessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#229ED9] hover:bg-[#1a8bbf] text-white py-3 rounded-xl font-semibold text-sm transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>
                  Telegram Bot
                </a>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={fpOtp}
                  onChange={e => setFpOtp(e.target.value.replace(/\D/g, ''))}
                  className={`${inputCls} text-center text-2xl tracking-widest font-bold`}
                  placeholder="000000"
                />
                {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
                <button
                  onClick={handleFpOtpVerify}
                  disabled={fpLoading || fpOtp.length !== 6}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60"
                >
                  {fpLoading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
                </button>
              </div>
            )}

            {fpStep === 'reset' && (
              <form onSubmit={handleFpReset} className="space-y-4">
                <input type="password" required value={fpNewPw} onChange={e => setFpNewPw(e.target.value)} placeholder="Yangi parol" className={inputCls} />
                <input type="password" required value={fpConfirmPw} onChange={e => setFpConfirmPw(e.target.value)} placeholder="Parolni tasdiqlang" className={inputCls} />
                {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
                <button type="submit" disabled={fpLoading} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60">
                  {fpSaved ? 'Saqlandi ✓' : fpLoading ? 'Saqlanmoqda...' : 'Parolni saqlash'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-0 sm:pb-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overscroll-contain touch-pan-y" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button onClick={() => { setTab('signin'); setRegistered(false); }} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'signin' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>{t('signIn')}</button>
              <button onClick={() => setTab('signup')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'signup' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>{t('signUp')}</button>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          {/* SIGN IN */}
          {tab === 'signin' && (
            <div>
              {registered && <p className="text-green-600 dark:text-green-400 text-sm mb-4 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">{t('registrationSuccess')}</p>}
              <form onSubmit={handleSignIn} className="space-y-4">
                <input type="email" required placeholder={t('email')} value={siEmail} onChange={e => setSiEmail(e.target.value)} className={inputCls} />
                <input type="password" required placeholder={t('password')} value={siPass} onChange={e => setSiPass(e.target.value)} className={inputCls} />
                {siError && <p className="text-red-500 text-sm">{siError}</p>}
                <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">{t('signIn')}</button>
              </form>
              <button onClick={() => setShowForgot(true)} className="mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline w-full text-center">{t('forgotPassword')}</button>
            </div>
          )}

          {/* SIGN UP */}
          {tab === 'signup' && (
            <div>
              {signupStep === 'form' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <input type="text" required placeholder={t('fullName')} value={suName} onChange={e => setSuName(e.target.value)} className={inputCls} />
                  <input type="email" required placeholder={t('email')} value={suEmail} onChange={e => setSuEmail(e.target.value)} className={inputCls} />
                  <input type="password" required placeholder={t('password')} value={suPass} onChange={e => setSuPass(e.target.value)} className={inputCls} />
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('dob')}</label>
                    <DateInput value={suDob} onChange={setSuDob} />
                  </div>
                  <select required value={suGender} onChange={e => setSuGender(e.target.value)} className={inputCls}>
                    <option value="" disabled>{t('gender')}</option>
                    <option value="male">{t('genderMale')}</option>
                    <option value="female">{t('genderFemale')}</option>
                    <option value="other">{t('genderOther')}</option>
                  </select>
                  <input type="tel" required placeholder={t('phone')} value={suPhone} onChange={e => setSuPhone(e.target.value)} className={inputCls} />
                  {suError && <p className="text-red-500 text-sm">{suError}</p>}
                  <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">{t('signUp')}</button>
                </form>
              )}

              {signupStep === 'telegram' && (
                <div className="space-y-3 pt-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {tgLinked ? '✅ Ulandi!' : "⏳ Botga o'tib \"Start\" ni bosing, keyin kodni quyida kiriting:"}
                  </p>
                  <a
                    href={`https://t.me/JamshidBilanBot?start=${tgSessionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#229ED9] hover:bg-[#1a8bbf] text-white py-3 rounded-xl font-semibold text-sm transition"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>
                    Telegram Bot
                  </a>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={tgOtp}
                    onChange={e => setTgOtp(e.target.value.replace(/\D/g, ''))}
                    className={`${inputCls} text-center text-2xl tracking-widest font-bold`}
                    placeholder="000000"
                  />
                  {tgError && <p className="text-red-500 text-sm">{tgError}</p>}
                  <button
                    onClick={handleOtpVerify}
                    disabled={tgLoading || tgOtp.length !== 6}
                    className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition"
                  >
                    {tgLoading ? 'Tekshirilmoqda...' : "Ro'yxatdan o'tish"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
