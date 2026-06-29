import { useTranslations } from 'next-intl';

const STATS = [
  { key: 'fullRide', value: '10+' },
  { key: 'admissions', value: '100+' },
  { key: 'countries', value: '25+' },
  { key: 'years', value: '4+' },
];

export default function StatsBanner() {
  const t = useTranslations('stats');
  return (
    <section className="bg-[#0d9488] dark:bg-[#0D1F3C] text-white py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map((s) => (
          <div key={s.key} className="bg-white/10 rounded-xl p-4">
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-teal-100 dark:text-[#2dd4bf] text-sm mt-1 uppercase tracking-wide">{t(s.key as any)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
