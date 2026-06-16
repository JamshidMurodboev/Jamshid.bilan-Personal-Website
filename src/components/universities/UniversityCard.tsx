import type { University } from '@/lib/supabase/types';

const TYPE_COLORS = {
  public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
};
const TYPE_LABELS = { public: 'Davlat', private: 'Xususiy' };

export default function UniversityCard({ university: u }: { university: University }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{u.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{u.city ? `${u.city}, ` : ''}{u.country}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[u.type]}`}>
          {TYPE_LABELS[u.type]}
        </span>
      </div>
      {u.tuition_usd != null && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">O'qish narxi:</span> ${u.tuition_usd.toLocaleString()}/yil
        </div>
      )}
      {u.ranking != null && <div className="text-xs text-gray-500 dark:text-gray-400">Reyting: #{u.ranking}</div>}
      {u.programs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {u.programs.slice(0, 3).map((p) => (
            <span key={p} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{p}</span>
          ))}
        </div>
      )}
      {u.website_url && (
        <a
          href={u.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto border border-teal-700 dark:border-teal-500 text-teal-700 dark:text-teal-400 text-center py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition"
        >
          Rasmiy sayt
        </a>
      )}
    </div>
  );
}
