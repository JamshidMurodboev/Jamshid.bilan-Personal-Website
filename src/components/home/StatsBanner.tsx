import { useTranslations } from 'next-intl';

const STATS = [
  { key: 'fullRide', value: '5+' },
  { key: 'admissions', value: '100+' },
  { key: 'countries', value: '10+' },
  { key: 'years', value: '4+' },
];

export default function StatsBanner() {
  const t = useTranslations('stats');
  return (
    <section className="bg-teal-700 text-white py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((s) => (
          <div
            key={s.key}
            className="bg-white/10 rounded-2xl px-6 py-8 text-center border border-white/20 hover:bg-white/20 transition"
          >
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{s.value}</div>
            <div className="text-teal-200 text-sm font-medium uppercase tracking-wide">{t(s.key as Parameters<typeof t>[0])}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
