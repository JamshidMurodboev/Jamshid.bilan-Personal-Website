'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Image from 'next/image';
import ContactModal from '@/components/shared/ContactModal';

const MARQUEE_ITEMS = [
  'Türkiye Burslari',
  '2× Erasmus+',
  '100+ Admissions',
  '10+ Grant Winners',
  '25+ Countries',
  '4+ Years Mentoring',
];

function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative border-y border-line bg-soft overflow-hidden py-4 select-none">
      <div className="flex whitespace-nowrap anim-marquee w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center" aria-hidden={half === 1}>
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center text-[13px] font-bold uppercase tracking-[0.2em] text-muted-e">
                <span className="px-6">{item}</span>
                <span className="text-accent">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stamp() {
  return (
    <div className="absolute -bottom-8 -left-8 sm:-left-12 w-28 h-28 sm:w-32 sm:h-32 anim-spin-slow" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <path id="stamp-circle" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill="var(--card-bg)" stroke="var(--line)" strokeWidth="1" />
        <text fontSize="9.5" fontWeight="700" letterSpacing="2.5" fill="var(--heading)">
          <textPath href="#stamp-circle">SCHOLARSHIP MENTOR ✦ SINCE 2023 ✦</textPath>
        </text>
        <text x="50" y="56" textAnchor="middle" fontSize="17" fill="var(--accent)">✦</text>
      </svg>
    </div>
  );
}

export default function HeroSection() {
  const t = useTranslations('hero');
  const [open, setOpen] = useState(false);

  const headline = t('headline');
  const words = headline.split(' ');
  const lastWord = words.pop();
  const headStart = words.join(' ');

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="container-page">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-10 items-center pt-14 sm:pt-20 pb-20 sm:pb-28">

          {/* Left — editorial headline */}
          <div className="anim-fade-up">
            <p className="eyebrow mb-8">{t('badge')}</p>

            <h1 className="display text-[2.9rem] sm:text-6xl lg:text-[4.6rem] mb-8">
              {headStart}{' '}
              <em>{lastWord}</em>
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed max-w-xl mb-10 text-body">
              {t('subheadline')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button onClick={() => setOpen(true)} className="btn-ink">
                {t('cta')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button onClick={() => setOpen(true)} className="btn-ghost">
                {t('ctaWhatsApp')}
              </button>
            </div>
          </div>

          {/* Right — arch portrait */}
          <div className="relative flex justify-center lg:justify-end anim-fade-up anim-delay-2">
            <div className="relative">
              {/* Offset frame line */}
              <div className="absolute -top-4 -right-4 w-full h-full rounded-t-full border border-line" aria-hidden="true" />

              <div className="relative w-[280px] h-[380px] sm:w-[330px] sm:h-[450px] rounded-t-full overflow-hidden bg-soft">
                <Image src="/hero.png" alt="Jamshid Murodboev" fill className="object-cover" priority />
              </div>

              {/* Caption under the arch */}
              <div className="mt-5 flex items-baseline justify-between gap-3">
                <p className="font-display text-lg text-heading">Jamshid Murodboev</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent whitespace-nowrap">Mentor</p>
              </div>

              <Stamp />
            </div>
          </div>
        </div>
      </div>

      <Marquee />

      <ContactModal isOpen={open} onClose={() => setOpen(false)} />
    </section>
  );
}
