'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ContactForm from '@/components/shared/ContactForm';
import BookingModal from '@/components/shared/BookingModal';

const INCLUDED = ['include1', 'include2', 'include3', 'include4', 'include5', 'include6'];

export default function HomeContactSection() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <section className="section-pad border-t border-line" id="contact">
      <div className="container-page">
        <div className="mb-14">
          <p className="eyebrow mb-4">Konsultatsiya</p>
          <h2 className="display text-4xl sm:text-5xl mb-4">{t('title')}</h2>
          <p className="text-lg text-body max-w-2xl">{t('autoNote')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left — what's included */}
          <div>
            <div className="bg-card border border-card rounded-3xl p-8 mb-6">
              <div className="pb-6 border-b border-line">
                <h3 className="font-display text-2xl text-heading mb-1">1-on-1 Konsultatsiya</h3>
                <p className="text-sm text-muted-e">{t('duration')}</p>
              </div>
              <ul className="py-4">
                {INCLUDED.map((key, i) => (
                  <li key={key} className="flex items-baseline gap-4 py-2.5 text-sm text-body">
                    <span className="font-display text-base text-accent w-6 flex-shrink-0 leading-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{t(key as any)}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-5 border-t border-line flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden="true" />
                <span className="text-sm text-muted-e">{t('slots' as any)}</span>
              </div>
              {/* Book CTA */}
              <button
                onClick={() => setBookingOpen(true)}
                className="btn-accent w-full mt-6"
              >
                {t('bookCta')}
              </button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-line rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted-e font-medium leading-snug">{t(`trust${n}` as any)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — contact form */}
          <div className="bg-card border border-card rounded-3xl p-5 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} locale={locale} />
    </section>
  );
}
