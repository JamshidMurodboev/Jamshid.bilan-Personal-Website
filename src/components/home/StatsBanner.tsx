'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

const STATS = [
  { key: 'fullRide', target: 10, suffix: '+' },
  { key: 'admissions', target: 100, suffix: '+' },
  { key: 'countries', target: 25, suffix: '+' },
  { key: 'years', target: 4, suffix: '' },
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

function StatCard({ target, label, suffix, started, index }: { target: number; label: string; suffix: string; started: boolean; index: number }) {
  const value = useCountUp(target, started);
  return (
    <div className="flex flex-col gap-3 py-10 px-6 sm:px-10 border-line [&:not(:first-child)]:border-t sm:[&:not(:first-child)]:border-t-0 sm:[&:not(:first-child)]:border-l">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-e">0{index + 1}</span>
      <div className="font-display text-5xl sm:text-6xl text-heading tabular-nums leading-none">
        {value}<span className="text-accent">{suffix}</span>
      </div>
      <div className="text-sm text-body leading-snug">{label}</div>
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
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="container-page">
        <div className="grid sm:grid-cols-4 border border-line rounded-3xl overflow-hidden bg-card">
          {STATS.map((s, i) => (
            <StatCard key={s.key} index={i} target={s.target} label={t(s.key as any)} suffix={s.suffix} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
