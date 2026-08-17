'use client';
import { useTranslations } from 'next-intl';

interface Props {
  search: string; onSearch: (v: string) => void;
  country: string; onCountry: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  category: string; onCategory: (v: string) => void;
  countries: string[];
}

const inputClass = 'w-full px-4 py-3 rounded-xl border border-line bg-card text-heading text-sm focus:outline-none focus:border-[var(--accent)] transition-colors';
const labelClass = 'text-xs font-bold uppercase tracking-widest text-muted-e block mb-1.5';

export default function ScholarshipFilters({ search, onSearch, country, onCountry, status, onStatus, category, onCategory, countries }: Props) {
  const t = useTranslations('filters');
  const tc = useTranslations('common');
  const hasFilter = !!(search || country || status || category);

  return (
    <div className="bg-card border border-card rounded-[1.25rem] p-5">
      <h3 className="font-display text-lg text-heading mb-4">{t('title')}</h3>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>{t('search')}</label>
          <input type="text" value={search} onChange={(e) => onSearch(e.target.value)} placeholder={t('grantPlaceholder')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t('country')}</label>
          <select value={country} onChange={(e) => onCountry(e.target.value)} className={inputClass}>
            <option value="">{t('all')}</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('funding')}</label>
          <select value={category} onChange={(e) => onCategory(e.target.value)} className={inputClass}>
            <option value="">{t('all')}</option>
            <option value="fully_funded">{t('fullyFunded')}</option>
            <option value="partially_funded">{t('partiallyFunded')}</option>
            <option value="self_funded">{t('selfFunded')}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('status')}</label>
          <select value={status} onChange={(e) => onStatus(e.target.value)} className={inputClass}>
            <option value="">{t('all')}</option>
            <option value="open">{tc('open')}</option>
            <option value="closed">{tc('closed')}</option>
            <option value="upcoming">{tc('upcoming')}</option>
          </select>
        </div>
        {hasFilter && (
          <button
            onClick={() => { onSearch(''); onCountry(''); onStatus(''); onCategory(''); }}
            className="w-full text-xs font-semibold text-accent hover:underline pt-1"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}
