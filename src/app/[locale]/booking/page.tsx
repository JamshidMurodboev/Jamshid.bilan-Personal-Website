'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import PhoneInput from '@/components/shared/PhoneInput';

const inp = 'w-full px-4 py-3 rounded-xl border border-line bg-card text-heading text-sm focus:outline-none focus:border-[var(--accent)] transition-colors';
const lbl = 'block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5';

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
      <main className="min-h-screen bg-page flex items-center justify-center px-5">
        <div className="card-e p-10 sm:p-12 text-center max-w-md w-full anim-fade-up">
          <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-line flex items-center justify-center text-accent" aria-hidden="true">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-heading mb-3">{t('successTitle')}</h2>
          <p className="text-muted-e text-sm">{t('successDesc')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page py-16 sm:py-24 px-5">
      <div className="max-w-xl mx-auto">
        <div className="mb-10">
          <h1 className="display text-4xl sm:text-5xl mb-4">{t('pageTitle')}</h1>
          <p className="text-body text-sm sm:text-base">{t('pageSubtitle')}</p>
        </div>

        <div className="bg-card border border-card rounded-3xl p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">{error}</div>}

            <div>
              <label className={lbl}>{t('name')} *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className={inp}
                placeholder={t('name')}
              />
            </div>

            <div>
              <label className={lbl}>{t('phone')} *</label>
              <PhoneInput
                required
                onChange={(phone, valid) => setForm({...form, phone, phoneValid: valid})}
              />
            </div>

            <div>
              <label className={lbl}>{t('topic')}</label>
              <textarea
                rows={3}
                value={form.topic}
                onChange={e => setForm({...form, topic: e.target.value})}
                className={inp}
                placeholder={t('topicPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{t('preferredDate')}</label>
                <input
                  type="date"
                  min={today}
                  value={form.preferred_date}
                  onChange={e => setForm({...form, preferred_date: e.target.value})}
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>{t('preferredTime')}</label>
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
              className="btn-accent w-full disabled:opacity-60 mt-2"
            >
              {submitting ? '...' : t('submit')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
