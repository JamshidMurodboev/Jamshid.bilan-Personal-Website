import type { University } from '@/types';

const STATUS_COLORS = {
  accepting: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  rolling: 'bg-blue-100 text-blue-800',
};
const STATUS_LABELS = {
  accepting: 'Qabul ochiq',
  closed: 'Yopiq',
  rolling: 'Doimiy qabul',
};

export default function UniversityCard({ university: u }: { university: University }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{u.name}</h3>
          <p className="text-sm text-gray-500">{u.city}, {u.country}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[u.status]}`}>
          {STATUS_LABELS[u.status]}
        </span>
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-medium">O'qish narxi:</span> ${u.tuition_min.toLocaleString()}–${u.tuition_max.toLocaleString()} {u.currency}/yil
      </div>
      <div className="text-xs text-gray-500">Til: {u.language_of_instruction}</div>
      <div className="flex flex-wrap gap-1">
        {u.programs.slice(0, 3).map((p) => (
          <span key={p} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{p}</span>
        ))}
      </div>
      <a href={u.website_url} target="_blank" rel="noopener noreferrer"
        className="mt-auto border border-teal-700 text-teal-700 text-center py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 transition">
        Rasmiy sayt
      </a>
    </div>
  );
}
