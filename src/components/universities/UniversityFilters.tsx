'use client';
import { useTranslations } from 'next-intl';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  country: string;
  onCountry: (v: string) => void;
  type: string;
  onType: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  countries: string[];
}

export default function UniversityFilters({ search, onSearch, country, onCountry, type, onType, status, onStatus, countries }: Props) {
  const t = useTranslations('filters');
  const tc = useTranslations('common');
  const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">{t('title')}</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('search')}</label>
          <input
            type="text"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder={t('universityPlaceholder')}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('country')}</label>
          <select value={country} onChange={e => onCountry(e.target.value)} className={inputCls}>
            <option value="">{t('all')}</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('type')}</label>
          <select value={type} onChange={e => onType(e.target.value)} className={inputCls}>
            <option value="">{t('all')}</option>
            <option value="public">{t('publicType')}</option>
            <option value="private">{t('privateType')}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('status')}</label>
          <select value={status} onChange={e => onStatus(e.target.value)} className={inputCls}>
            <option value="">{t('all')}</option>
            <option value="open">{tc('open')}</option>
            <option value="closed">{tc('closed')}</option>
            <option value="upcoming">{tc('upcoming')}</option>
          </select>
        </div>
        {(search || country || type || status) && (
          <button
            onClick={() => { onSearch(''); onCountry(''); onType(''); onStatus(''); }}
            className="w-full text-xs text-teal-700 dark:text-teal-400 hover:underline pt-1"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}
