'use client';
import { useState } from 'react';
import { SAMPLE_SCHOLARSHIPS, SAMPLE_UNIVERSITIES } from '@/lib/data';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const TELEGRAM_URL = 'https://t.me/jamshid_bilan';

export default function TelegramContactButton({ children, className }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [noCert, setNoCert] = useState(false);
  const [form, setForm] = useState({ name: '', applying: '', dob: '', certName: '', certScore: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Ism kamida 2 harf bo'lishi kerak";
    if (!form.applying) e.applying = 'Ariza turini tanlang';
    if (!form.dob) e.dob = "Tug'ilgan sanani kiriting";
    if (!noCert) {
      if (!form.certName.trim()) e.certName = 'Sertifikat nomini kiriting';
      if (!form.certScore.trim()) e.certScore = 'Ball kiriting';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
    setNoCert(false);
    setForm({ name: '', applying: '', dob: '', certName: '', certScore: '' });
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const certInfo = noCert ? "Yo'q" : `${form.certName} — ${form.certScore}`;
    const [year, month, day] = form.dob.split('-');
    const formattedDob = `${day}.${month}.${year}`;

    const message = [
      "Salom! Men quyidagi ma'lumotlarim bilan murojaat qilmoqchiman:",
      '',
      `👤 Ism: ${form.name}`,
      `🎯 Ariza: ${form.applying}`,
      `📅 Tug'ilgan sana: ${formattedDob}`,
      `🌐 Til sertifikati: ${certInfo}`,
    ].join('\n');

    navigator.clipboard.writeText(message).catch(() => {});
    setSubmitted(true);
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';
  const errorClass = 'text-red-500 text-xs mt-1';

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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">✈️</span>
                <h2 className="text-base font-bold text-gray-900">Telegram orqali bog&apos;lanish</h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                ×
              </button>
            </div>

            {submitted ? (
              /* Success state */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  📋
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ma&apos;lumotlaringiz nusxalandi!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Telegram ochilgach, chat maydoniga <strong>paste</strong> qiling (Ctrl+V / ⌘V).
                </p>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0088cc] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0077b5] transition shadow"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.152.678-.554.843-1.123.524l-3.1-2.284-1.497 1.44c-.165.165-.304.304-.624.304l.223-3.165 5.757-5.197c.25-.223-.054-.347-.389-.124L6.838 14.04l-3.054-.953c-.664-.208-.678-.664.138-.982l11.931-4.6c.554-.2 1.04.138.709.743z"/>
                  </svg>
                  Telegramni ochish
                </a>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <p className="text-xs text-gray-500">
                  Quyidagi ma&apos;lumotlarni to&apos;ldiring — ular Telegram chatiga avtomatik nusxalanadi.
                </p>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To&apos;liq ism <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className={inputClass}
                    placeholder="Ism va familiyangiz"
                  />
                  {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>

                {/* Applying for */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qaysi dastur uchun ariza <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.applying}
                    onChange={e => set('applying', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Tanlang...</option>
                    <optgroup label="Grantlar">
                      {SAMPLE_SCHOLARSHIPS.map(s => (
                        <option key={s.id} value={`Grant: ${s.title} (${s.country})`}>
                          {s.title} — {s.country}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Universitetlar">
                      {SAMPLE_UNIVERSITIES.map(u => (
                        <option key={u.id} value={`Universitet: ${u.name} (${u.country})`}>
                          {u.name} — {u.country}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {errors.applying && <p className={errorClass}>{errors.applying}</p>}
                </div>

                {/* Date of birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tug&apos;ilgan sana <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={e => set('dob', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={inputClass}
                  />
                  {errors.dob && <p className={errorClass}>{errors.dob}</p>}
                </div>

                {/* Language certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Til sertifikati <span className="text-red-500">*</span>
                  </label>
                  <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noCert}
                      onChange={e => {
                        setNoCert(e.target.checked);
                        if (e.target.checked) setErrors(err => ({ ...err, certName: '', certScore: '' }));
                      }}
                      className="w-4 h-4 rounded accent-teal-600"
                    />
                    <span className="text-sm text-gray-600">Til sertifikatim yo&apos;q</span>
                  </label>
                  {!noCert && (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          value={form.certName}
                          onChange={e => set('certName', e.target.value)}
                          className={inputClass}
                          placeholder="IELTS, TOEFL, DELF..."
                        />
                        {errors.certName && <p className={errorClass}>{errors.certName}</p>}
                      </div>
                      <div className="w-28">
                        <input
                          value={form.certScore}
                          onChange={e => set('certScore', e.target.value)}
                          className={inputClass}
                          placeholder="Ball"
                        />
                        {errors.certScore && <p className={errorClass}>{errors.certScore}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0088cc] text-white py-3 rounded-xl font-semibold hover:bg-[#0077b5] transition shadow flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.152.678-.554.843-1.123.524l-3.1-2.284-1.497 1.44c-.165.165-.304.304-.624.304l.223-3.165 5.757-5.197c.25-.223-.054-.347-.389-.124L6.838 14.04l-3.054-.953c-.664-.208-.678-.664.138-.982l11.931-4.6c.554-.2 1.04.138.709.743z"/>
                  </svg>
                  Telegram orqali yuborish
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
