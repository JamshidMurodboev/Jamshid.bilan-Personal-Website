'use client';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  country: string;
  onCountry: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
}

export default function ScholarshipFilters({ search, onSearch, country, onCountry, status, onStatus }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Filtr</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Qidirish</label>
          <input type="text" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Grant nomi..." className="w-full border rounded-lg p-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Mamlakat</label>
          <select value={country} onChange={(e) => onCountry(e.target.value)} className="w-full border rounded-lg p-2 text-sm text-gray-700">
            <option value="">Hammasi</option>
            <option>Turkiya</option>
            <option>Buyuk Britaniya</option>
            <option>Germaniya</option>
            <option>AQSh</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Holat</label>
          <select value={status} onChange={(e) => onStatus(e.target.value)} className="w-full border rounded-lg p-2 text-sm text-gray-700">
            <option value="">Hammasi</option>
            <option value="open">Ochiq</option>
            <option value="closed">Yopiq</option>
            <option value="coming_soon">Tez kunda</option>
          </select>
        </div>
      </div>
    </div>
  );
}
