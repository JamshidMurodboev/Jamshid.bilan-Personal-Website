'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import ContactModal from '@/components/shared/ContactModal';

export default function HeroSection() {
  const t = useTranslations('hero');
  const [open, setOpen] = useState(false);
  return (
    <section className="bg-gradient-to-br from-teal-800 to-teal-600 text-white py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full" />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          Xorijda tahsil maslahatchisi
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{t('headline')}</h1>
        <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-2xl mx-auto">{t('subheadline')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setOpen(true)}
            className="bg-white text-teal-800 px-8 py-3 rounded-xl font-semibold hover:bg-teal-50 transition"
          >
            {t('cta')}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            {t('ctaWhatsApp')}
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" className="fill-[#faf7f2] dark:fill-gray-950" />
        </svg>
      </div>
      <ContactModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  );
}
