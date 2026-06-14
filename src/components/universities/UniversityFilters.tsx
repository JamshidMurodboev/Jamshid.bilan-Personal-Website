'use client';

export default function UniversityFilters() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">Filtr</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Mamlakat</label>
          <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
            <option value="">Hammasi</option>
            <option>Turkiya</option>
            <option>Germaniya</option>
            <option>AQSh</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Ta&apos;lim tili</label>
          <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
            <option value="">Hammasi</option>
            <option>Turk tili</option>
            <option>Ingliz tili</option>
            <option>Nemis tili</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Qidirish</label>
          <input type="text" placeholder="Universitet nomi..." className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
