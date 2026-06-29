'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import DateInput from '@/components/shared/DateInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

type Step = 'form' | 'confirm' | 'verify';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }: Props) {
  const t = useTranslations('auth');
  const { login, signup } = useAuth();
  const [tab, setTab] = useState(initialTab);

  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass] = useState('');
  const [siError, setSiError] = useState('');

  const [step, setStep] = useState<Step>('form');
  const [suName, setSuName] = useState('');
  const [suDob, setSuDob] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suPhoto, setSuPhoto] = useState('');
  const [suError, setSuError] = useState('');
  const [suLoading, setSuLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const verifyLockRef = useRef(false);
  const confirmLockRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setStep('form');
      setSiError('');
      setSuError('');
      setVerifyCode('');
      verifyLockRef.current = false;
      confirmLockRef.current = false;
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!siEmail.trim() || !siPass) { setSiError(t('invalidCredentials')); return; }
    const err = login(siEmail, siPass);
    if (err) { setSiError(t('invalidCredentials')); return; }
    onClose();
  }

  function handleSignUpForm(e: React.FormEvent) {
    e.preventDefault();
    if (!suName.trim()) { setSuError(t('nameRequired')); return; }
    if (!suDob) { setSuError(t('dobRequired')); return; }
    if (suPass.length < 6) { setSuError(t('error')); return; }
    setSuError('');
    setStep('confirm');
  }

  async function handleConfirm() {
    if (confirmLockRef.current) return;
    confirmLockRef.current = true;
    setSuLoading(true);
    setSuError('');
    try {
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: suEmail, name: suName }),
      });
      const data = await res.json();
      if (!res.ok) { setSuError(data.error || t('error')); setSuLoading(false); confirmLockRef.current = false; return; }
      setStep('verify');
    } catch {
      setSuError(t('error'));
    }
    setSuLoading(false);
    confirmLockRef.current = false;
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (verifyLockRef.current) return;
    verifyLockRef.current = true;
    setSuLoading(true);
    setSuError('');

    let verified = false;
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: suEmail, code: verifyCode }),
      });
      verified = res.ok;
    } catch {
      verified = false;
    }

    if (!verified) {
      setSuError(t('verifyError'));
      setSuLoading(false);
      verifyLockRef.current = false;
      return;
    }

    const err = signup(suName, suDob, suEmail, suPass, suPhoto || undefined);
    setSuLoading(false);
    verifyLockRef.current = false;
    if (err) { setSuError(err); return; }
    onClose();
  }

  async function handleResend() {
    setSuLoading(true);
    try {
      await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: suEmail, name: suName }),
      });
    } catch {}
    setSuLoading(false);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSuPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500';
  const errInputCls = 'w-full border border-red-400 dark:border-red-500 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500';

  const showTabs = tab === 'signin' || step === 'form';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {showTabs && (
          <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => { setTab('signin'); setStep('form'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                tab === 'signin' ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
              }`}
            >{t('signIn')}</button>
            <button
              onClick={() => { setTab('signup'); setStep('form'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                tab === 'signup' ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
              }`}
            >{t('signUp')}</button>
          </div>
        )}

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
            <button type="button" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">{t('forgotPassword')}</button>
            {siError && <p className="text-red-500 text-sm">{siError}</p>}
            <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">{t('signInBtn')}</button>
          </form>
        )}

        {tab === 'signup' && step === 'form' && (
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('email')} *</label>
              <input type="email" required value={suEmail} onChange={e => setSuEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('password')} *</label>
              <input type="password" required minLength={6} value={suPass} onChange={e => setSuPass(e.target.value)} className={inputCls} />
            </div>
            {suError && <p className="text-red-500 text-sm">{suError}</p>}
            <button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition">{t('signUpBtn')}</button>
          </form>
        )}

        {tab === 'signup' && step === 'confirm' && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('confirmTitle')}</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('confirmName')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{suName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('confirmDob')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{suDob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('confirmEmail')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{suEmail}</span>
              </div>
            </div>
            {suError && <p className="text-red-500 text-sm">{suError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >{t('back')}</button>
              <button
                onClick={handleConfirm}
                disabled={suLoading}
                className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60"
              >{suLoading ? t('sendingCode') : t('confirm')}</button>
            </div>
          </div>
        )}

        {tab === 'signup' && step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('verifyTitle')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('verifyDesc')}</p>
              <p className="text-sm font-medium text-teal-700 dark:text-teal-400 mt-1">{suEmail}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('verifyCode')}</label>
              <input
                type="text"
                required
                maxLength={6}
                disabled={suLoading}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className={`${inputCls} text-center text-2xl tracking-widest`}
                placeholder="000000"
              />
            </div>
            {suError && <p className="text-red-500 text-sm text-center">{suError}</p>}
            <button
              type="submit"
              disabled={suLoading || verifyCode.length < 6}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60"
            >{suLoading ? t('verifying') : t('verifyBtn')}</button>
            <button
              type="button"
              onClick={handleResend}
              disabled={suLoading}
              className="w-full text-sm text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-60"
            >{t('resend')}</button>
          </form>
        )}
      </div>
    </div>
  );
}
