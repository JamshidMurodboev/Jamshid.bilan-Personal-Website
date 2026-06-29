'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Image from 'next/image';
import ContactModal from '@/components/shared/ContactModal';

export default function HeroSection() {
  const t = useTranslations('hero');
  const [open, setOpen] = useState(false);
  return (
    <section id="hero" className="bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] dark:from-[#0A1628] dark:to-[#0D1F3C] text-[#0f172a] dark:text-[#e6edf3] py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 dark:bg-[#3b82f6]/10 rounded-full dark:blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/10 dark:bg-white/5 rounded-full" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10 grid md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left">
          <span className="inline-block bg-[#ccfbf1] dark:bg-[#0d2d2a] text-[#0f766e] dark:text-[#2dd4bf] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            {t('badge')}
          </span>
          <h1 className="text-4xl md:text-[3rem] font-extrabold mb-4 leading-tight">{t('headline')}</h1>
          <p className="text-lg md:text-xl text-[#334155] dark:text-[#8b949e] mb-8 max-w-2xl mx-auto md:mx-0">{t('subheadline')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => setOpen(true)}
              className="bg-[#0d9488] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0f766e] transition"
            >
              {t('cta')}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="border-2 border-[#0d9488] text-[#0d9488] dark:text-[#2dd4bf] dark:border-[#2dd4bf] px-8 py-3 rounded-xl font-semibold hover:bg-[#0d9488]/10 transition"
            >
              {t('ctaWhatsApp')}
            </button>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="relative w-80 h-96 md:w-[26rem] md:h-[30rem] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/50">
            <Image src="/hero.png" alt="Helsinki" fill className="object-cover" priority />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" className="fill-white dark:fill-[#0d1117]" />
        </svg>
      </div>
      <ContactModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  );
}
