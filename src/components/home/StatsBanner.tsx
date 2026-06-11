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
    <section className="bg-teal-700 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map((s) => (
          <div key={s.key}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-teal-200 text-sm mt-1">{t(s.key as any)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
