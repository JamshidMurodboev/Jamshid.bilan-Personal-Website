'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

const STATS = [
  { key: 'fullRide', target: 10 },
  { key: 'admissions', target: 100 },
  { key: 'countries', target: 25 },
  { key: 'years', target: 4 },
];

const DURATION = 1800;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

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

export default function StatsBanner() {
  const t = useTranslations('stats');
  const sectionRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0d9488] dark:bg-[#0D1F3C] text-white py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map(s => (
          <StatCard key={s.key} target={s.target} label={t(s.key as any)} started={started} />
        ))}
      </div>
    </section>
  );
}

function StatCard({ target, label, started }: { target: number; label: string; started: boolean }) {
  const value = useCountUp(target, started);
  return (
    <div className="bg-white/10 rounded-xl p-4">
      <div className="text-3xl font-bold tabular-nums">{value}+</div>
      <div className="text-teal-100 dark:text-[#2dd4bf] text-sm mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
