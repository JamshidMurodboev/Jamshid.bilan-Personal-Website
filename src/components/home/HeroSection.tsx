'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Image from 'next/image';
import ContactModal from '@/components/shared/ContactModal';

export default function HeroSection() {
  const t = useTranslations('hero');
  const [open, setOpen] = useState(false);

  const badges = [
    { emoji: '🏆', text: 'Türkiye Bursları', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700' },
    { emoji: '🎓', text: '2× Erasmus+', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700' },
    { emoji: '✅', text: '100+ Admissions', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' },
    { emoji: '🌍', text: '10+ Winners', color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700' },
  ];

  return (
    <section id="hero" className="relative bg-gradient-to-br from-[#e8f5f4] via-white to-[#e0f2f1] dark:from-[#071212] dark:via-[#0d1117] dark:to-[#091a1a] overflow-hidden pt-24 pb-0">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/8 dark:bg-teal-500/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/10 dark:bg-teal-600/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4" />
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{backgroundImage: 'linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center lg:min-h-[calc(100vh-4rem)] pb-16">

          <div className="text-center lg:text-left pt-8 lg:pt-0">
            <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              {t('badge')}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6">
              {t('headline')}
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {t('subheadline')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <button
                onClick={() => setOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('cta')}
              </button>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center gap-2 border-2 border-teal-700 dark:border-teal-500 text-teal-700 dark:text-teal-400 hover:bg-teal-700 hover:text-white dark:hover:bg-teal-700 dark:hover:text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
              >
                {t('ctaWhatsApp')}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {badges.map((b) => (
                <span key={b.text} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${b.color}`}>
                  <span>{b.emoji}</span>
                  {b.text}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end relative">
            <div className="relative">
              <div className="relative w-72 h-[360px] sm:w-80 sm:h-[460px] lg:w-[360px] lg:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/60 border-4 border-white dark:border-gray-800">
                <Image src="/hero.png" alt="Jamshid Murodboev" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-4 right-4">
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-xl px-4 py-2.5">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Jamshid Murodboev</p>
                    <p className="text-teal-700 dark:text-teal-400 text-xs font-medium">Scholarship Mentor & Consultant</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-xl rounded-2xl px-3 py-2 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Grant G&apos;olibi</p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Türkiye Bursları</p>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-xl rounded-2xl px-3 py-2 flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Mentorship</p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">100+ Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
          <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" className="fill-white dark:fill-[#0d1117]" />
        </svg>
      </div>

      <ContactModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  );
}
