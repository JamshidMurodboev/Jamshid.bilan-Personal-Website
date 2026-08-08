'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import DateInput from '@/components/shared/DateInput';

const CERTS = ['IELTS', 'TOEFL', 'TYS', 'SAT', 'Other', 'None'];

interface Props {
  children: React.ReactNode;
  className?: string;
  scholarshipContext?: string;
  universityContext?: string;
  serviceContext?: string;
}

const baseInputCls = 'w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500';
const okBorder = 'border-gray-300 dark:border-gray-600';
const errBorder = 'border-red-400 dark:border-red-500 focus:ring-red-500';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1';

export default function AskQuestionButton({ children, className, scholarshipContext, universityContext, serviceContext }: Props) {
  const { user } = useAuth();
  const t = useTranslations('contact.form');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [cert, setCert] = useState('');
  const [score, setScore] = useState('');
  const [question, setQuestion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      if (user.fullName) setName(user.fullName);
      if (user.dob) setDob(user.dob);
      if (user.languageCertificate?.type) setCert(user.languageCertificate.type);
      if (user.languageCertificate?.score) setScore(user.languageCertificate.score);
    }
  }, [user]);

  function inputCls(field: string) {
    return `${baseInputCls} ${errors[field] ? errBorder : okBorder}`;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('errors.name');
    if (!dob) e.dob = t('errors.dob');
    if (!cert) e.cert = t('errors.cert');
    if (cert && cert !== 'None' && !score.trim()) e.score = t('errors.score');
    if (!question.trim()) e.question = t('errors.question');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleClose() {
    setOpen(false);
    setErrors({});
    setQuestion('');
    if (!user) {
      setName('');
      setDob('');
    }
    setCert('');
    setScore('');
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const certStr = cert === 'None' ? t('certNone') : cert;
    const scoreStr = cert === 'None' || !score.trim() ? '—' : score;

    const lines = [
      t('greetingLine'),
      '',
      t('writingAbout'),
      '',
      `Ism: ${name}`,
      `Tug'ilgan sana: ${dob}`,
      `Til sertifikati: ${certStr}`,
      `Ball: ${scoreStr}`,
    ];
    if (scholarshipContext) lines.push(`Grant: ${scholarshipContext}`);
    if (universityContext) lines.push(`Universitet: ${universityContext}`);
    if (serviceContext) lines.push(`Xizmat: ${serviceContext}`);
    lines.push('');
    lines.push(`_Savol: ${question}_`);

    const message = lines.join('\n');
    window.open(`https://t.me/jamshid_bilan?text=${encodeURIComponent(message)}`, '_blank');
    handleClose();
  }

  const telegramIcon = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.55 14.4l-2.94-.916c-.64-.203-.654-.64.136-.954l11.5-4.433c.533-.194 1.001.131.816.15z"/>
    </svg>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('askQuestion')}</h2>
              </div>
              <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">×</button>
            </div>

            <form onSubmit={handleSend} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className={labelCls}>{t('name')} *</label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })); }} placeholder={t('name')} className={inputCls('name')} />
                {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelCls}>{t('dob')} *</label>
                <DateInput value={dob} onChange={v => { setDob(v); setErrors(er => ({ ...er, dob: '' })); }} className={inputCls('dob')} />
                {errors.dob && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.dob}</p>}
              </div>

              <div>
                <label className={labelCls}>{t('cert')} *</label>
                <select value={cert} onChange={e => { setCert(e.target.value); setScore(''); setErrors(er => ({ ...er, cert: '' })); }} className={inputCls('cert')}>
                  <option value="">{t('selectPlaceholder')}</option>
                  {CERTS.map(c => <option key={c} value={c}>{c === 'None' ? t('certNone') : c}</option>)}
                </select>
                {errors.cert && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.cert}</p>}
              </div>

              {cert && cert !== 'None' && (
                <div>
                  <label className={labelCls}>{t('score')} *</label>
                  <input type="text" value={score} onChange={e => { setScore(e.target.value); setErrors(er => ({ ...er, score: '' })); }} placeholder="Masalan: 6.5" className={inputCls('score')} />
                  {errors.score && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.score}</p>}
                </div>
              )}

              <div>
                <label className={labelCls}>{t('questionLabel')} *</label>
                <textarea
                  value={question}
                  onChange={e => { setQuestion(e.target.value); setErrors(er => ({ ...er, question: '' })); }}
                  placeholder={t('questionPlaceholder')}
                  rows={4}
                  className={`${inputCls('question')} resize-none`}
                />
                {errors.question && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.question}</p>}
              </div>

              <button type="submit" className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white py-3 rounded-xl font-semibold transition shadow flex items-center justify-center gap-2">
                {telegramIcon}
                {t('sendBtn')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
