'use client';

export default function UniversityFilters() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Filtr</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Mamlakat</label>
          <select className="w-full border rounded-lg p-2 text-sm text-gray-700">
            <option value="">Hammasi</option>
            <option>Turkiya</option>
            <option>Germaniya</option>
            <option>AQSh</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Ta'lim tili</label>
          <select className="w-full border rounded-lg p-2 text-sm text-gray-700">
            <option value="">Hammasi</option>
            <option>Turk tili</option>
            <option>Ingliz tili</option>
            <option>Nemis tili</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Qidirish</label>
          <input type="text" placeholder="Universitet nomi..." className="w-full border rounded-lg p-2 text-sm" />
        </div>
      </div>
    </div>
  );
}
