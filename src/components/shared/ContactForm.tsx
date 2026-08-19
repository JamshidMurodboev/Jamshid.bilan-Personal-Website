'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/auth';
import DateInput from '@/components/shared/DateInput';
import { createClient } from '@/lib/supabase/client';

const CERTS = ['IELTS', 'TOEFL', 'TYS', 'SAT', 'Other', 'None'];

function buildMessage(name: string, dob: string, cert: string, score: string, target: string, other: string, noneLabel: string) {
  const targetStr = target === 'other' ? other : target === 'all' ? 'Barchasi' : target;
  const certStr = cert === 'None' ? noneLabel : cert;
  const scoreStr = cert === 'None' || !score.trim() ? '—' : score;
  return encodeURIComponent(
    `Assalomu Alaykum.\n\nHujjat topshirish bo'yicha yozayapman.\n\nIsm: ${name}\nTug'ilgan sana: ${dob}\nTil sertifikati: ${certStr}\nBall: ${scoreStr}\nMaqsad: ${targetStr}`
  );
}

const baseInputCls = 'w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500';
const okBorder = 'border-gray-300 dark:border-gray-600';
const errBorder = 'border-red-400 dark:border-red-500 focus:ring-red-500';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1';

type FieldErrors = Partial<Record<'name' | 'dob' | 'cert' | 'score' | 'target' | 'other', string>>;

interface Props {
  preselectedTarget?: string;
}

export default function ContactForm({ preselectedTarget }: Props = {}) {
  const { user } = useAuth();
  const t = useTranslations('contact.form');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [cert, setCert] = useState('');
  const [score, setScore] = useState('');
  const [target, setTarget] = useState(preselectedTarget ?? '');
  const [other, setOther] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [scholarships, setScholarships] = useState<{ id: string; title: string; country: string }[]>([]);
  const [universities, setUniversities] = useState<{ id: string; name: string; country: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name_uz: string; name_ru?: string; name_en?: string }[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      setDob(user.dob || '');
      if (user.languageCertificate?.type) {
        setCert(user.languageCertificate.type);
        setScore(user.languageCertificate.score || '');
      }
    }
  }, [user]);

  useEffect(() => {
    const sb = createClient();
    sb.from('scholarships').select('id,title,country').order('title').then(({ data }) => {
      if (data && data.length > 0) setScholarships(data);
    });
    sb.from('universities').select('id,name,country').order('name').then(({ data }) => {
      if (data && data.length > 0) setUniversities(data);
    });
    sb.from('services').select('id,name_uz,name_ru,name_en').eq('status', 'active').order('home_order', { ascending: true, nullsFirst: false }).then(({ data }) => {
      if (data && data.length > 0) setServices(data);
    });
  }, []);

  function validate() {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = t('errors.name');
    if (!dob) e.dob = t('errors.dob');
    if (!cert) e.cert = t('errors.cert');
    if (cert && cert !== 'None' && !score.trim()) e.score = t('errors.score');
    if (!target) e.target = t('errors.target');
    if (target === 'other' && !other.trim()) e.other = t('errors.other');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function inputCls(field: keyof FieldErrors) {
    return `${baseInputCls} ${errors[field] ? errBorder : okBorder}`;
  }

  function open(url: string) {
    if (!validate()) return;
    const targetStr = target === 'other' ? other : target === 'all' ? 'Barchasi' : target;
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        dob,
        certificate: cert === 'None' ? null : cert,
        score: cert === 'None' ? null : score,
        target: targetStr,
        locale,
      }),
    }).catch(() => {});
    window.open(`${url}${buildMessage(name, dob, cert, score, target, other, t('certNone'))}`, '_blank');
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>{t('name')} *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('name')} className={inputCls('name')} />
        {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className={labelCls}>{t('dob')} *</label>
        <DateInput value={dob} onChange={setDob} className={inputCls('dob')} />
        {errors.dob && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.dob}</p>}
      </div>
      <div>
        <label className={labelCls}>{t('cert')} *</label>
        <select value={cert} onChange={e => { setCert(e.target.value); setScore(''); }} className={inputCls('cert')}>
          <option value="">{t('selectPlaceholder')}</option>
          {CERTS.map(c => <option key={c} value={c}>{c === 'None' ? t('certNone') : c}</option>)}
        </select>
        {errors.cert && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.cert}</p>}
      </div>
      {cert && cert !== 'None' && (
        <div>
          <label className={labelCls}>{t('score')} *</label>
          <input type="text" value={score} onChange={e => setScore(e.target.value)} placeholder="Masalan: 6.5" className={inputCls('score')} />
          {errors.score && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.score}</p>}
        </div>
      )}
      {!preselectedTarget && (
        <div>
          <label className={labelCls}>{t('grantOrUniversity')} *</label>
          <select value={target} onChange={e => setTarget(e.target.value)} className={inputCls('target')}>
            <option value="">{t('selectPlaceholder')}</option>
            <option value="all">Barchasi</option>
            {scholarships.length > 0 && (
              <optgroup label={t('grantGroup')}>
                {scholarships.map(s => (
                  <option key={s.id} value={`Grant: ${s.title} (${s.country})`}>{s.title} — {s.country}</option>
                ))}
              </optgroup>
            )}
            {universities.length > 0 && (
              <optgroup label={t('universityGroup')}>
                {universities.map(u => (
                  <option key={u.id} value={`Universitet: ${u.name} (${u.country})`}>{u.name} — {u.country}</option>
                ))}
              </optgroup>
            )}
            {services.length > 0 && (
              <optgroup label={t('servicesGroup')}>
                {services.map(s => {
                  const svcName = (s as any)[`name_${locale}`] || s.name_uz;
                  return (
                    <option key={s.id} value={`Xizmat: ${svcName}`}>{svcName}</option>
                  );
                })}
              </optgroup>
            )}
            <option value="other">{t('otherOption')}</option>
          </select>
          {errors.target && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.target}</p>}
        </div>
      )}
      {target === 'other' && (
        <div>
          <label className={labelCls}>{t('other')}</label>
          <input type="text" value={other} onChange={e => setOther(e.target.value)} placeholder="Grant yoki universitet nomini kiriting" className={inputCls('other')} />
          {errors.other && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.other}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => open('https://t.me/jamshid_bilan?text=')}
          className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white py-3 rounded-xl font-semibold text-sm transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.55 14.4l-2.94-.916c-.64-.203-.654-.64.136-.954l11.5-4.433c.533-.194 1.001.131.816.15z"/></svg>
          Telegram
        </button>
        <button
          onClick={() => open('https://wa.me/905074480893?text=')}
          className="flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20b956] text-white py-3 rounded-xl font-semibold text-sm transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
      </div>
    </div>
  );
}
