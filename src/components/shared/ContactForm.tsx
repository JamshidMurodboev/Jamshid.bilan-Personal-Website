'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

const SCHOLARSHIPS = ['Türkiye Bursları', 'Chevening Scholarship', 'DAAD Scholarship', 'Erasmus+', 'MEXT (Yaponiya)', 'Fulbright'];
const UNIVERSITIES = ['Istanbul University', 'Ankara University', 'Marmara University', 'Middle East Technical University', 'Bogazici University'];
const CERTS = ['IELTS', 'TOEFL', 'TYS', 'SAT', 'Other', 'None'];

function buildMessage(name: string, dob: string, cert: string, score: string, target: string, other: string) {
  const targetStr = target === 'other' ? other : target;
  const certStr = cert === 'None' ? "Yo'q" : cert;
  const scoreStr = cert === 'None' || !score.trim() ? '—' : score;
  return encodeURIComponent(
    `Assalomu Alaykum.\n\nHujjat topshirish bo'yicha yozayapman.\n\nIsm: ${name}\nTug'ilgan sana: ${dob}\nTil sertifikati: ${certStr}\nBall: ${scoreStr}\nAriza: ${targetStr}`
  );
}

const baseInputCls = 'w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500';
const okBorder = 'border-gray-300 dark:border-gray-600';
const errBorder = 'border-red-400 dark:border-red-500 focus:ring-red-500';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1';

type FieldErrors = Partial<Record<'name' | 'dob' | 'cert' | 'score' | 'target' | 'other', string>>;

export default function ContactForm() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [cert, setCert] = useState('');
  const [score, setScore] = useState('');
  const [target, setTarget] = useState('');
  const [other, setOther] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (user) {
      setName(user.fullName);
      setDob(user.dob);
    }
  }, [user]);

  function validate() {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = 'Ism kiritilmagan';
    if (!dob) e.dob = "Tug'ilgan sana kiritilmagan";
    if (!cert) e.cert = 'Til sertifikati tanlanmagan';
    if (cert && cert !== 'None' && !score.trim()) e.score = 'Ball kiritilmagan';
    if (!target) e.target = 'Grant yoki universitet tanlanmagan';
    if (target === 'other' && !other.trim()) e.other = 'Boshqa variant kiritilmagan';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function inputCls(field: keyof FieldErrors) {
    return `${baseInputCls} ${errors[field] ? errBorder : okBorder}`;
  }

  function open(url: string) {
    if (!validate()) return;
    window.open(`${url}${buildMessage(name, dob, cert, score, target, other)}`, '_blank');
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>To'liq ism *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ismingiz" className={inputCls('name')} />
        {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className={labelCls}>Tug'ilgan sana *</label>
        <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputCls('dob')} />
        {errors.dob && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.dob}</p>}
      </div>
      <div>
        <label className={labelCls}>Til sertifikati *</label>
        <select value={cert} onChange={e => { setCert(e.target.value); setScore(''); }} className={inputCls('cert')}>
          <option value="">Tanlang...</option>
          {CERTS.map(c => <option key={c} value={c}>{c === 'None' ? "Yo'q" : c}</option>)}
        </select>
        {errors.cert && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.cert}</p>}
      </div>
      {cert && cert !== 'None' && (
        <div>
          <label className={labelCls}>Ball *</label>
          <input type="text" value={score} onChange={e => setScore(e.target.value)} placeholder="Masalan: 6.5" className={inputCls('score')} />
          {errors.score && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.score}</p>}
        </div>
      )}
      <div>
        <label className={labelCls}>Grant yoki Universitet *</label>
        <select value={target} onChange={e => setTarget(e.target.value)} className={inputCls('target')}>
          <option value="">Tanlang...</option>
          <optgroup label="Grantlar">
            {SCHOLARSHIPS.map(s => <option key={s} value={s}>{s}</option>)}
          </optgroup>
          <optgroup label="Universitetlar">
            {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
          </optgroup>
          <option value="other">Boshqa...</option>
        </select>
        {errors.target && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.target}</p>}
      </div>
      {target === 'other' && (
        <div>
          <label className={labelCls}>Boshqa variant</label>
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
          onClick={() => open('https://wa.me/905052250893?text=')}
          className="flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20b956] text-white py-3 rounded-xl font-semibold text-sm transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>
      </div>
    </div>
  );
}
