'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import DateInput from '@/components/shared/DateInput';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth';

interface Props {
  children: React.ReactNode;
  className?: string;
  platform?: 'telegram' | 'whatsapp';
  scholarshipContext?: string;
  universityContext?: string;
  serviceContext?: string;
}

const TELEGRAM_URL = 'https://t.me/jamshid_bilan';
const WHATSAPP_NUMBER = '905052250893';

export default function TelegramContactButton({ children, className, platform = 'telegram', scholarshipContext, universityContext, serviceContext }: Props) {
  const t = useTranslations('contact.form');
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [noCert, setNoCert] = useState(false);
  const context = scholarshipContext ? `${t('grantPrefix')} ${scholarshipContext}` : universityContext ? `${t('universityPrefix')} ${universityContext}` : '';
  const [form, setForm] = useState({ name: '', applying: context, dob: '', certName: '', certScore: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scholarships, setScholarships] = useState<{ id: string; title: string; country: string }[]>([]);
  const [universities, setUniversities] = useState<{ id: string; name: string; country: string }[]>([]);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.fullName || f.name,
        dob: user.dob || f.dob,
        certName: user.languageCertificate?.type || f.certName,
        certScore: user.languageCertificate?.score || f.certScore,
      }));
      if (user.languageCertificate?.type === 'N/A') setNoCert(true);
    }
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const sb = createClient();
    sb.from('scholarships').select('id,title,country').order('title').then(({ data }) => {
      if (data && data.length > 0) setScholarships(data);
    });
    sb.from('universities').select('id,name,country').order('name').then(({ data }) => {
      if (data && data.length > 0) setUniversities(data);
    });
  }, [open]);

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
    setNoCert(false);
    const ctx = scholarshipContext ? `${t('grantPrefix')} ${scholarshipContext}` : universityContext ? `${t('universityPrefix')} ${universityContext}` : '';
    setForm({ name: '', applying: ctx, dob: '', certName: '', certScore: '' });
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const certInfo = noCert ? t('none') : `${form.certName} — ${form.certScore}`;
    const [year, month, day] = form.dob.split('-');
    const formattedDob = `${day}.${month}.${year}`;

    const message = [
      t('greetingLine'),
      '',
      t('writingAbout'),
      '',
      `Ism: ${form.name}`,
      `${t('applicationFor')}: ${form.applying}`,
      `${t('dobLabel')} ${formattedDob}`,
      `${t('certLabel')} ${certInfo}`,
    ].join('\n');

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      window.open(`https://t.me/jamshid_bilan?text=${encodeURIComponent(message)}`, '_blank');
    }

    try {
      await createClient().from('inquiries').insert({
        name: form.name,
        phone: '',
        message: `Ariza: ${form.applying}`,
        source: platform === 'whatsapp' ? 'whatsapp_button' : 'telegram_button',
        status: 'new',
        locale: 'uz',
        dob: form.dob,
        language_certificate: noCert ? t('none') : `${form.certName} — ${form.certScore}`,
        grant_interest: form.applying,
        created_at: new Date().toISOString(),
      });
    } catch {}

    handleClose();
  }

  const isWhatsApp = platform === 'whatsapp';
  const platformColor = isWhatsApp ? 'bg-[#25d366] hover:bg-[#20b956]' : 'bg-[#0088cc] hover:bg-[#0077b5]';
  const tRaw = (key: string, fallback: string) => { try { const v = t(key); return v === key || v.startsWith('contact.') ? fallback : v; } catch { return fallback; } };
  const platformTitle = tRaw('platformTitle', `${isWhatsApp ? 'WhatsApp' : 'Telegram'} orqali bog\'lanish`).replace('{platform}', isWhatsApp ? 'WhatsApp' : 'Telegram');
  const platformIcon = isWhatsApp ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.152.678-.554.843-1.123.524l-3.1-2.284-1.497 1.44c-.165.165-.304.304-.624.304l.223-3.165 5.757-5.197c.25-.223-.054-.347-.389-.124L6.838 14.04l-3.054-.953c-.664-.208-.678-.664.138-.982l11.931-4.6c.554-.2 1.04.138.709.743z"/></svg>
  );

  const inputClass = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <>
      <button type="button" onClick={() => {
        if (scholarshipContext) setForm(f => ({ ...f, applying: `${t('grantPrefix')} ${scholarshipContext}` }));
      else if (universityContext) setForm(f => ({ ...f, applying: `${t('universityPrefix')} ${universityContext}` }));
        setOpen(true);
      }} className={className}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={undefined}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">✈️</span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{platformTitle}</h2>
              </div>
              <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">×</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tRaw('fillDetails', `Quyidagi ma'lumotlarni to'ldiring — ular {platform} chatiga avtomatik yuboriladi.`).replace('{platform}', isWhatsApp ? 'WhatsApp' : 'Telegram')}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')} <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="Ism va familiyangiz" />
                  {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>

                {!scholarshipContext && !universityContext && !serviceContext && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('applicationFor')}</label>
                    <select value={form.applying} onChange={e => set('applying', e.target.value)} className={inputClass}>
                      <option value="">{t('selectPlaceholder')}</option>
                      {scholarships.length > 0 && (
                        <optgroup label="Grantlar">
                          {scholarships.map(s => (
                            <option key={s.id} value={`Grant: ${s.title} (${s.country})`}>{s.title} — {s.country}</option>
                          ))}
                        </optgroup>
                      )}
                      {universities.length > 0 && (
                        <optgroup label="Universitetlar">
                          {universities.map(u => (
                            <option key={u.id} value={`Universitet: ${u.name} (${u.country})`}>{u.name} — {u.country}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {errors.applying && <p className={errorClass}>{errors.applying}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dob')} <span className="text-red-500">*</span></label>
                  <DateInput value={form.dob} onChange={v => set('dob', v)} max={new Date().toISOString().split('T')[0]} className={inputClass} />
                  {errors.dob && <p className={errorClass}>{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('cert')} <span className="text-red-500">*</span></label>
                  <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                    <input type="checkbox" checked={noCert} onChange={e => { setNoCert(e.target.checked); if (e.target.checked) setErrors(err => ({ ...err, certName: '', certScore: '' })); }} className="w-4 h-4 rounded accent-teal-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('noCert')}</span>
                  </label>
                  {!noCert && (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input value={form.certName} onChange={e => set('certName', e.target.value)} className={inputClass} placeholder="IELTS, TOEFL, DELF..." />
                        {errors.certName && <p className={errorClass}>{errors.certName}</p>}
                      </div>
                      <div className="w-28">
                        <input value={form.certScore} onChange={e => set('certScore', e.target.value)} className={inputClass} placeholder="Ball" />
                        {errors.certScore && <p className={errorClass}>{errors.certScore}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className={`w-full ${platformColor} text-white py-3 rounded-xl font-semibold transition shadow flex items-center justify-center gap-2`}>
                  {platformIcon}
                  {tRaw('sendVia', '{platform} orqali yuborish').replace('{platform}', isWhatsApp ? 'WhatsApp' : 'Telegram')}
                </button>
              </form>
          </div>
        </div>
      )}
    </>
  );
}
