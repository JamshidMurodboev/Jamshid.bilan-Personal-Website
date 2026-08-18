'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PhoneInput from '@/components/shared/PhoneInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500';

export default function BookingModal({ isOpen, onClose, locale }: Props) {
  const t = useTranslations('contact');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '', phone: '', phoneValid: false,
    tg_username: '', topic: '',
    preferred_date: '', preferred_time: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setSuccess(false);
    setError(null);
    setForm({ name: '', phone: '', phoneValid: false, tg_username: '', topic: '', preferred_date: '', preferred_time: '' });
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phoneValid) { setError('To\'liq telefon raqamini kiriting'); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          tg_username: form.tg_username,
          topic: form.topic,
          preferred_date: form.preferred_date,
          preferred_time: form.preferred_time,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Xatolik yuz berdi'); return; }
      setSuccess(true);
    } catch {
      setError('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-3xl">✅</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('bookingSuccess')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookingSuccessDesc')}</p>
            <button onClick={handleClose} className="mt-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">OK</button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">📅 {t('bookCta')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('tgUsernameLabel')} *</label>
                <input
                  type="text"
                  required
                  value={form.tg_username}
                  onChange={e => setForm(f => ({ ...f, tg_username: e.target.value }))}
                  placeholder={t('tgUsernamePlaceholder')}
                  className={inp}
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('tgUsernameNote')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {locale === 'ru' ? 'Полное имя' : locale === 'en' ? 'Full name' : 'To\'liq ism'} *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {locale === 'ru' ? 'Телефон' : locale === 'en' ? 'Phone' : 'Telefon'} *
                </label>
                <PhoneInput onChange={(val, valid) => setForm(f => ({ ...f, phone: val, phoneValid: valid }))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {locale === 'ru' ? 'Цель / Вопрос' : locale === 'en' ? 'Goal / Question' : 'Maqsad / Savol'}
                </label>
                <textarea
                  rows={3}
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  placeholder={locale === 'ru' ? 'Например: хочу поступить в Türkiye Burslari' : locale === 'en' ? 'e.g. I want to apply for Türkiye Burslari' : 'Masalan: Türkiye Burslari uchun maslahat olmoqchiman'}
                  className={inp}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {locale === 'ru' ? 'Удобная дата' : locale === 'en' ? 'Preferred date' : 'Qulay sana'}
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.preferred_date}
                    onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {locale === 'ru' ? 'Удобное время' : locale === 'en' ? 'Preferred time' : 'Qulay vaqt'}
                  </label>
                  <input
                    type="text"
                    value={form.preferred_time}
                    onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))}
                    placeholder="10:00–12:00"
                    className={inp}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60"
              >
                {submitting ? '...' : t('submitBtn')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
