'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ContactForm from '@/components/shared/ContactForm';
import BookingModal from '@/components/shared/BookingModal';

const INCLUDED = [
  { emoji: '🎓', key: 'include1' },
  { emoji: '📝', key: 'include2' },
  { emoji: '📊', key: 'include3' },
  { emoji: '💼', key: 'include4' },
  { emoji: '🗺️', key: 'include5' },
  { emoji: '🎤', key: 'include6' },
];

export default function HomeContactSection() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <section className="py-24 px-4 bg-white dark:bg-[#0d1117]" id="contact">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-teal-600 dark:text-teal-400 mb-3">Konsultatsiya</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">{t('title')}</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('autoNote')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — what's included */}
          <div>
            <div className="bg-gradient-to-br from-teal-700 to-teal-800 dark:from-teal-800 dark:to-teal-900 rounded-3xl p-8 text-white mb-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🎯</span>
                <div>
                  <h3 className="text-xl font-bold">1-on-1 Konsultatsiya</h3>
                  <p className="text-teal-100 text-sm">{t('duration')}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item.key} className="flex items-center gap-3 text-sm">
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-base flex-shrink-0">{item.emoji}</span>
                    <span className="text-teal-50">{t(item.key as any)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-white/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-teal-100">{t('slots' as any)}</span>
              </div>
              {/* Book CTA */}
              <button
                onClick={() => setBookingOpen(true)}
                className="mt-4 w-full bg-white text-teal-800 font-bold py-3 rounded-2xl hover:bg-teal-50 transition text-sm"
              >
                📅 {t('bookCta')}
              </button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3">
              {['🔒', '💬', '✅'].map((emoji, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t(`trust${i + 1}` as any)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — contact form */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-3xl p-4 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} locale={locale} />
    </section>
  );
}
