'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PhoneInput from '@/components/shared/PhoneInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

const inp = 'w-full px-4 py-3 rounded-xl border border-line bg-card text-heading text-sm focus:outline-none focus:border-[var(--accent)] transition-colors';
const lbl = 'block text-xs font-bold uppercase tracking-widest text-muted-e mb-1.5';

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
      <div className="bg-card border border-card rounded-3xl shadow-2xl shadow-black/20 w-full max-w-md p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border border-line text-muted-e hover:border-accent hover:text-accent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-soft border border-line flex items-center justify-center">
              <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-heading">{t('bookingSuccess')}</h3>
            <p className="text-sm text-muted-e">{t('bookingSuccessDesc')}</p>
            <button onClick={handleClose} className="btn-ink mt-2 !px-6 !py-2.5 text-sm">OK</button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl text-heading mb-5">{t('bookCta')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={lbl}>{t('tgUsernameLabel')} *</label>
                <input
                  type="text"
                  required
                  value={form.tg_username}
                  onChange={e => setForm(f => ({ ...f, tg_username: e.target.value }))}
                  placeholder={t('tgUsernamePlaceholder')}
                  className={inp}
                />
                <p className="text-xs text-muted-e mt-1">{t('tgUsernameNote')}</p>
              </div>

              <div>
                <label className={lbl}>
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
                <label className={lbl}>
                  {locale === 'ru' ? 'Телефон' : locale === 'en' ? 'Phone' : 'Telefon'} *
                </label>
                <PhoneInput onChange={(val, valid) => setForm(f => ({ ...f, phone: val, phoneValid: valid }))} />
              </div>

              <div>
                <label className={lbl}>
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
                  <label className={lbl}>
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
                  <label className={lbl}>
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
                className="btn-ink w-full !py-3 text-sm disabled:opacity-60 disabled:pointer-events-none"
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
