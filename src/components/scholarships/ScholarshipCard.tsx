import type { Scholarship } from '@/lib/supabase/types';

const STATUS_COLORS = {
  open: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  closed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  upcoming: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
};
const STATUS_LABELS = { open: 'Ochiq', closed: 'Yopiq', upcoming: 'Kelayotgan' };

export default function ScholarshipCard({ scholarship: s }: { scholarship: Scholarship }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{s.country}{s.university ? ` · ${s.university}` : ''}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>
          {STATUS_LABELS[s.status]}
        </span>
      </div>
      {s.coverage.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {s.coverage.map((c) => (
            <span key={c} className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs px-2 py-0.5 rounded-full">{c}</span>
          ))}
        </div>
      )}
      {s.difficulty != null && (
        <div className="flex items-center gap-1 text-yellow-500 text-sm">
          {'★'.repeat(s.difficulty)}{'☆'.repeat(5 - s.difficulty)}
          <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">qiyinlik</span>
        </div>
      )}
      {s.deadline && <p className="text-xs text-gray-500 dark:text-gray-400">Muddati: {new Date(s.deadline).toLocaleDateString('uz-UZ')}</p>}
      {s.tip && <p className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-2 rounded-lg">💡 {s.tip}</p>}
      {s.application_url && (
        <a
          href={s.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto bg-teal-700 hover:bg-teal-800 text-white text-center py-2 rounded-xl text-sm font-semibold transition"
        >
          Ariza topshirish
        </a>
      )}
    </div>
  );
}
