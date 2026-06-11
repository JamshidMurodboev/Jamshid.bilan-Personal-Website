import type { Scholarship } from '@/types';

const STATUS_COLORS = {
  open: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  coming_soon: 'bg-yellow-100 text-yellow-800',
};

const STATUS_LABELS = {
  open: 'Ochiq',
  closed: 'Yopiq',
  coming_soon: 'Tez kunda',
};

export default function ScholarshipCard({ scholarship: s }: { scholarship: Scholarship }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{s.title}</h3>
          <p className="text-sm text-gray-500">{s.country}{s.university ? ` · ${s.university}` : ''}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[s.status]}`}>
          {STATUS_LABELS[s.status]}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {s.coverage.map((c) => (
          <span key={c} className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-yellow-500 text-sm">
        {'★'.repeat(s.difficulty)}{'☆'.repeat(5 - s.difficulty)}
        <span className="text-gray-400 text-xs ml-1">qiyinlik</span>
      </div>
      <p className="text-xs text-gray-500">Muddati: {new Date(s.deadline).toLocaleDateString('uz-UZ')}</p>
      {s.tip && <p className="text-xs bg-amber-50 text-amber-800 p-2 rounded-lg">💡 {s.tip}</p>}
      <a href={s.application_url} target="_blank" rel="noopener noreferrer"
        className="mt-auto bg-teal-700 text-white text-center py-2 rounded-xl text-sm font-semibold hover:bg-teal-800 transition">
        Ariza topshirish
      </a>
    </div>
  );
}
