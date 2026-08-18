'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

const STATS = [
  { key: 'fullRide', target: 10, icon: '🏆', suffix: '+' },
  { key: 'admissions', target: 100, icon: '🎓', suffix: '+' },
  { key: 'countries', target: 25, icon: '🌍', suffix: '+' },
  { key: 'years', target: 4, icon: '⭐', suffix: '' },
];

const DURATION = 1800;

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

function useCountUp(target: number, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      setValue(Math.round(easeOut(progress) * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);
  return value;
}

function StatCard({ target, label, icon, suffix, started }: { target: number; label: string; icon: string; suffix: string; started: boolean }) {
  const value = useCountUp(target, started);
  return (
    <div className="flex flex-col items-center gap-2 p-6">
      <span className="text-3xl">{icon}</span>
      <div className="text-4xl font-extrabold text-white tabular-nums tracking-tight">
        {value}{suffix}
      </div>
      <div className="text-sm font-medium text-teal-100 dark:text-teal-200 text-center leading-snug uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function StatsBanner() {
  const t = useTranslations('stats');
  const sectionRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0]?.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 dark:from-teal-900 dark:via-teal-800 dark:to-teal-900 py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 opacity-10" aria-hidden="true" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
      <div className="relative max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-teal-600/40 md:divide-y-0 border border-teal-600/40 rounded-3xl overflow-hidden bg-white/5 dark:bg-black/10 backdrop-blur-sm">
          {STATS.map((s) => (
            <StatCard key={s.key} target={s.target} label={t(s.key as any)} icon={s.icon} suffix={s.suffix} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
