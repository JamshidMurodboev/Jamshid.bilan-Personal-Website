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
  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-line bg-card text-sm text-heading focus:outline-none focus:border-[var(--accent)] transition-colors';
  const labelCls = 'text-xs font-bold uppercase tracking-widest text-muted-e block mb-1.5';
  const pillCls = (active: boolean) =>
    active
      ? 'bg-ink text-[var(--bg)] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors'
      : 'border border-line text-body rounded-full px-3.5 py-1.5 text-xs hover:border-[var(--accent)] hover:text-accent transition-colors';

  return (
    <div className="bg-card rounded-2xl border border-card p-5">
      <h3 className="font-display text-lg text-heading mb-4">{t('title')}</h3>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>{t('search')}</label>
          <input
            type="text"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder={t('universityPlaceholder')}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{t('country')}</label>
          <select value={country} onChange={e => onCountry(e.target.value)} className={inputCls}>
            <option value="">{t('all')}</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span className={labelCls}>{t('type')}</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onType('')} className={pillCls(type === '')}>{t('all')}</button>
            <button type="button" onClick={() => onType('public')} className={pillCls(type === 'public')}>{t('publicType')}</button>
            <button type="button" onClick={() => onType('private')} className={pillCls(type === 'private')}>{t('privateType')}</button>
          </div>
        </div>
        <div>
          <span className={labelCls}>{t('status')}</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onStatus('')} className={pillCls(status === '')}>{t('all')}</button>
            <button type="button" onClick={() => onStatus('open')} className={pillCls(status === 'open')}>{tc('open')}</button>
            <button type="button" onClick={() => onStatus('closed')} className={pillCls(status === 'closed')}>{tc('closed')}</button>
            <button type="button" onClick={() => onStatus('upcoming')} className={pillCls(status === 'upcoming')}>{tc('upcoming')}</button>
          </div>
        </div>
        {(search || country || type || status) && (
          <button
            onClick={() => { onSearch(''); onCountry(''); onType(''); onStatus(''); }}
            className="w-full text-xs font-semibold text-accent hover:underline pt-1"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}
