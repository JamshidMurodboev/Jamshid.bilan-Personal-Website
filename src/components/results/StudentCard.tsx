import type { StudentResult } from '@/types';

export default function StudentCard({ result: r }: { result: StudentResult }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-lg">
          {r.first_name[0]}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{r.first_name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{r.award_name} · {r.year}</div>
        </div>
      </div>
      {r.quote && <p className="text-sm text-gray-600 dark:text-gray-300 italic">&ldquo;{r.quote}&rdquo;</p>}
      <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">{r.country}</div>
    </div>
  );
}
