'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/lib/auth';
import DateInput from '@/components/shared/DateInput';
import PhoneInput from '@/components/shared/PhoneInput';
import Select from '@/components/shared/Select';
import { showToast } from '@/components/shared/Toast';

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

  // Sign-in state
  const [siPhone, setSiPhone] = useState('');
  const [siPhoneValid, setSiPhoneValid] = useState(false);
  const [siPass, setSiPass] = useState('');
  const [siError, setSiError] = useState('');
  const [siLoading, setSiLoading] = useState(false);

  // Sign-up state
  const [suName, setSuName] = useState('');
  const [suDob, setSuDob] = useState('');
  const [suGender, setSuGender] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suPhoneValid, setSuPhoneValid] = useState(false);
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

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [fpPhone, setFpPhone] = useState('');
  const [fpPhoneValid, setFpPhoneValid] = useState(false);
  const [fpStep, setFpStep] = useState<'phone' | 'telegram' | 'otp' | 'newpw'>('phone');
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
      setFpStep('phone');
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
    if (!siPhoneValid || !siPass) { setSiError(t('invalidCredentials')); return; }
    setSiLoading(true);
    setSiError('');
    try {
      const err = await login(siPhone, siPass);
      if (err) { setSiError(err); return; }
      showToast(t('signedInToast'));
      onClose();
    } catch {
      setSiError(t('error'));
    } finally {
      setSiLoading(false);
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
    if (!suPhoneValid) { setSuError(t('phoneInvalid')); return; }
    if (suPass.length < 6) { setSuError(t('error')); return; }
    setSuError('');
    setTgLoading(true);
    try {
      const res = await fetch('/api/telegram/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'signup', phone: suPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setSuError(data.error ? `${t('telegramSessionError')}: ${data.error}` : t('telegramSessionError')); return; }
      setTgSessionId(data.sessionId);
      setTgBotLink(data.botLink);
      setSignupStep('telegram');
      startPolling(data.sessionId, 'signup');
    } catch {
      setSuError(t('error'));
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
    if (tgOtp.length !== 6) { setTgError(t('enterCode6')); return; }
    setTgLoading(true);
    setTgError('');
    try {
      const verifyAbort = new AbortController();
      const verifyTimeout = setTimeout(() => verifyAbort.abort(), 15000);
      let verifyRes: Response;
      try {
        verifyRes = await fetch('/api/telegram/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: tgSessionId, otp: tgOtp }),
          signal: verifyAbort.signal,
        });
      } finally {
        clearTimeout(verifyTimeout);
      }
      const data = await verifyRes!.json();
      if (!verifyRes!.ok) { setTgError(data.error || t('wrongCode')); return; }

      setTgError('Akkaunt yaratilmoqda...');
      const err = await signup({
        fullName: suName,
        dob: suDob,
        gender: suGender,
        password: suPass,
        phone: suPhone,
        photoDataUrl: suPhoto || undefined,
      });
      if (err) { setTgError(err); return; }
      setTgError('');
      setRegistered(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setTgError(`Xatolik: ${msg}`);
    } finally {
      setTgLoading(false);
    }
  }

  async function handleFpPhone(e: React.FormEvent) {
    e.preventDefault();
    if (!fpPhoneValid) { setFpError(t('phoneInvalid')); return; }
    setFpLoading(true);
    setFpError('');
    try {
      const res = await fetch('/api/telegram/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'reset', phone: fpPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error ? `${t('telegramSessionError')}: ${data.error}` : t('telegramSessionError')); return; }
      setFpSessionId(data.sessionId);
      setFpBotLink(data.botLink);
      setFpStep('telegram');
      startPolling(data.sessionId, 'reset');
    } catch {
      setFpError(t('error'));
    } finally {
      setFpLoading(false);
    }
  }

  async function handleFpOtpVerify() {
    if (fpOtp.length !== 6) { setFpError(t('enterCode6')); return; }
    setFpLoading(true);
    setFpError('');
    try {
      const res = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: fpSessionId, otp: fpOtp }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error || t('wrongCode')); return; }
      setFpStep('newpw');
    } catch {
      setFpError(t('error'));
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
        body: JSON.stringify({ phone: fpPhone, sessionId: fpSessionId, newPassword: fpNewPw }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error || t('error')); return; }
      setForgotMode(false);
      setTab('signin');
    } catch {
      setFpError(t('error'));
    } finally {
      setFpLoading(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-line bg-card text-heading text-sm focus:outline-none focus:border-[var(--accent)] transition-colors';
  const errInputCls = 'w-full px-4 py-3 rounded-xl border border-red-400 bg-card text-heading text-sm focus:outline-none focus:border-red-500 transition-colors';

  if (registered) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-card border border-card rounded-3xl shadow-2xl shadow-black/20 w-full max-w-sm p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-soft border border-line flex items-center justify-center">
            <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-heading">
            {t('saved')} ✓
          </h2>
          <p className="text-sm text-muted-e">
            {t('loading')}
          </p>
          <div className="w-full bg-soft rounded-full h-1 overflow-hidden">
            <div className="h-1 rounded-full" style={{ background: 'var(--accent)', width: '100%', transformOrigin: 'left', animation: 'shrink 2.5s linear forwards' }} />
          </div>
        </div>
        <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
      </div>
    );
  }

  if (forgotMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-card border border-card rounded-3xl shadow-2xl shadow-black/20 w-full max-w-md p-6 sm:p-7 relative">
          <button onClick={() => setForgotMode(false)} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border border-line text-muted-e hover:border-accent hover:text-accent transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="font-display text-2xl text-heading mb-5">{t('resetPassword')}</h2>

          {fpStep === 'phone' && (
            <form onSubmit={handleFpPhone} className="space-y-4">
              <p className="text-sm text-muted-e">{t('fpInstructions')}</p>
              <PhoneInput
                onChange={(val, valid) => { setFpPhone(val); setFpPhoneValid(valid); }}
              />
              {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
              <button type="submit" disabled={fpLoading} className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none">
                {fpLoading ? t('loading') : t('continueBtn')}
              </button>
            </form>
          )}

          {fpStep === 'telegram' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-soft border border-line flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.41l-2.948-.924c-.64-.203-.652-.64.136-.948l11.52-4.44c.534-.194 1.001.13.766.15z"/></svg>
              </div>
              <p className="text-sm text-body font-medium">{t('telegramGoBot')}</p>
              <a href={fpBotLink} target="_blank" rel="noopener noreferrer" className="btn-ink !px-6 !py-3 text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.41l-2.948-.924c-.64-.203-.652-.64.136-.948l11.52-4.44c.534-.194 1.001.13.766.15z"/></svg>
                {t('openTelegramBot')}
              </a>
              <div className="space-y-3 pt-2 w-full">
                <p className="text-xs text-muted-e">
                  {fpLinked ? t('linked') : t('enterCodeBelow')}
                </p>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, ''))} className={`${inputCls} text-center text-2xl tracking-widest font-bold`} placeholder="000000" />
                {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
                <button onClick={handleFpOtpVerify} disabled={fpLoading || fpOtp.length !== 6} className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none">
                  {fpLoading ? t('checking') : t('verifyCode')}
                </button>
              </div>
            </div>
          )}

          {fpStep === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-e text-center">{t('otpInstructions')}</p>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, ''))} className={`${inputCls} text-center text-2xl tracking-widest font-bold`} placeholder="000000" />
              {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
              <button onClick={handleFpOtpVerify} disabled={fpLoading} className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none">
                {fpLoading ? t('checking') : t('confirm')}
              </button>
            </div>
          )}

          {fpStep === 'newpw' && (
            <form onSubmit={handleFpNewPw} className="space-y-4">
              <p className="text-sm text-muted-e text-center">{t('confirmed')}</p>
              <input type="password" required minLength={6} value={fpNewPw} onChange={e => setFpNewPw(e.target.value)} className={inputCls} placeholder={t('newPasswordPlaceholder')} />
              {fpError && <p className="text-red-500 text-sm">{fpError}</p>}
              <button type="submit" disabled={fpLoading} className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none">
                {fpLoading ? t('saving') : t('savePassword')}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-card border border-card rounded-3xl shadow-2xl shadow-black/20 w-full max-w-md p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto no-scrollbar overscroll-contain touch-pan-y">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border border-line text-muted-e hover:border-accent hover:text-accent transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex gap-2 mb-6 pr-10">
          <button onClick={() => setTab('signin')} className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'signin' ? 'bg-ink text-[var(--bg)]' : 'border border-line text-body hover:border-accent hover:text-accent'}`}>{t('signIn')}</button>
          <button onClick={() => setTab('signup')} className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'signup' ? 'bg-ink text-[var(--bg)]' : 'border border-line text-body hover:border-accent hover:text-accent'}`}>{t('signUp')}</button>
        </div>

        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5">{t('phone')}</label>
              <PhoneInput
                onChange={(val, valid) => { setSiPhone(val); setSiPhoneValid(valid); }}
                className={siError ? 'border-red-400' : ''}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5">{t('password')}</label>
              <input type="password" required value={siPass} onChange={e => setSiPass(e.target.value)} className={siError ? errInputCls : inputCls} />
            </div>
            <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-accent hover:underline">{t('forgotPassword')}</button>
            {siError && <p className="text-red-500 text-sm">{siError}</p>}
            <button type="submit" disabled={siLoading} className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none">{siLoading ? t('loading') : t('signInBtn')}</button>
          </form>
        )}

        {tab === 'signup' && signupStep === 'form' && (
          <form onSubmit={handleSignUpForm} className="space-y-4">
            <div className="flex justify-center">
              <button type="button" onClick={() => fileRef.current?.click()} className="relative w-20 h-20 rounded-full overflow-hidden bg-soft flex items-center justify-center border border-dashed border-line hover:border-accent transition-colors">
                {suPhoto ? <img src={suPhoto} alt="avatar" className="w-full h-full object-cover" /> : (
                  <div className="text-center">
                    <svg className="w-6 h-6 text-muted-e mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs text-muted-e">{t('photo')}</span>
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhoto} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5">{t('fullName')} *</label>
              <input type="text" required value={suName} onChange={e => setSuName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5">{t('dob')} *</label>
              <DateInput required value={suDob} onChange={setSuDob} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5">{t('gender')} *</label>
              <Select
                value={suGender}
                onChange={setSuGender}
                required
                placeholder={t('gender')}
                aria-label={t('gender')}
                options={[
                  { value: 'male', label: t('genderMale') },
                  { value: 'female', label: t('genderFemale') },
                  { value: 'other', label: t('genderOther') },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5">{t('password')} *</label>
              <input type="password" required minLength={6} value={suPass} onChange={e => setSuPass(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5">{t('phone')} *</label>
              <PhoneInput required onChange={(val, valid) => { setSuPhone(val); setSuPhoneValid(valid); }} />
            </div>
            {suError && <p className="text-red-500 text-sm">{suError}</p>}
            <button type="submit" disabled={tgLoading} className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none">
              {tgLoading ? t('loading') : t('signUpBtn')}
            </button>
          </form>
        )}

        {tab === 'signup' && signupStep === 'telegram' && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-soft border border-line flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.41l-2.948-.924c-.64-.203-.652-.64.136-.948l11.52-4.44c.534-.194 1.001.13.766.15z"/></svg>
            </div>
            <div>
              <p className="font-display text-lg text-heading mb-1">{t('telegramVerify')}</p>
              <p className="text-sm text-muted-e">{t('telegramInstructions')}</p>
            </div>
            <a href={tgBotLink} target="_blank" rel="noopener noreferrer" className="btn-ink !px-6 !py-3 text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.41l-2.948-.924c-.64-.203-.652-.64.136-.948l11.52-4.44c.534-.194 1.001.13.766.15z"/></svg>
              {t('openTelegramBot')}
            </a>
            <div className="space-y-3 pt-1 w-full">
              <p className="text-xs text-muted-e">
                {tgLinked ? t('linked') : t('enterCodeBelow')}
              </p>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={tgOtp} onChange={e => setTgOtp(e.target.value.replace(/\D/g, ''))} className={`${inputCls} text-center text-2xl tracking-widest font-bold`} placeholder="000000" />
              {tgError && <p className="text-red-500 text-sm">{tgError}</p>}
              <button onClick={handleOtpVerify} disabled={tgLoading || tgOtp.length !== 6} className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none">
                {tgLoading ? t('checking') : t('registerBtn')}
              </button>
            </div>
            <button type="button" onClick={() => setSignupStep('form')} className="text-xs text-muted-e hover:text-accent underline transition-colors">← {t('back')}</button>
          </div>
        )}

        {tab === 'signup' && signupStep === 'otp' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-e text-center">{t('otpInstructions')}</p>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={tgOtp} onChange={e => setTgOtp(e.target.value.replace(/\D/g, ''))} className={`${inputCls} text-center text-2xl tracking-widest font-bold`} placeholder="000000" autoFocus />
            {tgError && <p className="text-red-500 text-sm">{tgError}</p>}
            <button onClick={handleOtpVerify} disabled={tgLoading} className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none">
              {tgLoading ? t('checking') : t('registerBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
