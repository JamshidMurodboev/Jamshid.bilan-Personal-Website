import type { StudentResult } from '@/types';

export default function StudentCard({ result: r }: { result: StudentResult }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
          {r.first_name[0]}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{r.first_name}</div>
          <div className="text-xs text-gray-500">{r.award_name} · {r.year}</div>
        </div>
      </div>
      {r.quote && <p className="text-sm text-gray-600 italic">"{r.quote}"</p>}
      <div className="mt-3 text-xs text-gray-400">{r.country}</div>
    </div>
  );
}
