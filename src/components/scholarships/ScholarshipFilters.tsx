'use client';

interface Props {
  search: string; onSearch: (v: string) => void;
  country: string; onCountry: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  category: string; onCategory: (v: string) => void;
  countries: string[];
}

export default function ScholarshipFilters({ search, onSearch, country, onCountry, status, onStatus, category, onCategory, countries }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">Filtr</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Qidirish</label>
          <input type="text" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Grant nomi..." className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Mamlakat</label>
          <select value={country} onChange={(e) => onCountry(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
            <option value="">Hammasi</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Moliyalashtirish</label>
          <select value={category} onChange={(e) => onCategory(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
            <option value="">Hammasi</option>
            <option value="fully_funded">To'liq moliyalashtirilgan</option>
            <option value="partially_funded">Qisman moliyalashtirilgan</option>
            <option value="self_funded">Kontrakt asosida</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Holat</label>
          <select value={status} onChange={(e) => onStatus(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700">
            <option value="">Hammasi</option>
            <option value="open">Ochiq</option>
            <option value="closed">Yopiq</option>
            <option value="upcoming">Kelayotgan</option>
          </select>
        </div>
      </div>
    </div>
  );
}
