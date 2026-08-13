'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import PhoneInput from '@/components/shared/PhoneInput';

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500';

export default function BookingPage() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    phone: '',
    phoneValid: false,
    topic: '',
    preferred_date: '',
    preferred_time: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          topic: form.topic,
          preferred_date: form.preferred_date || null,
          preferred_time: form.preferred_time || null,
          locale,
        }),
      });
      const data = await res.json();
      if (data.success) { setSuccess(true); } else { setError(data.error || 'Xatolik yuz berdi'); }
    } catch {
      setError('Xatolik yuz berdi');
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-[#e2e8f0] dark:border-[#21262d] p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('successTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('successDesc')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pageTitle')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('pageSubtitle')}</p>
        </div>

        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-[#e2e8f0] dark:border-[#21262d] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')} *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className={inp}
                placeholder={t('name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')} *</label>
              <PhoneInput
                required
                onChange={(phone, valid) => setForm({...form, phone, phoneValid: valid})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('topic')}</label>
              <textarea
                rows={3}
                value={form.topic}
                onChange={e => setForm({...form, topic: e.target.value})}
                className={inp}
                placeholder={t('topicPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('preferredDate')}</label>
                <input
                  type="date"
                  min={today}
                  value={form.preferred_date}
                  onChange={e => setForm({...form, preferred_date: e.target.value})}
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('preferredTime')}</label>
                <input
                  type="text"
                  value={form.preferred_time}
                  onChange={e => setForm({...form, preferred_time: e.target.value})}
                  className={inp}
                  placeholder={t('preferredTimePlaceholder')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-xl disabled:opacity-60 transition mt-2"
            >
              {submitting ? '...' : t('submit')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
