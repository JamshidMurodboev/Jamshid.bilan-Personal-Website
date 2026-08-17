'use client';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import UniversityCard from '@/components/universities/UniversityCard';
import UniversityFilters from '@/components/universities/UniversityFilters';
import type { University } from '@/lib/supabase/types';

interface Props {
  universities: University[];
  locale: string;
}

export default function UniversityList({ universities, locale }: Props) {
  const t = useTranslations('common');
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const countries = useMemo(
    () => Array.from(new Set(universities.map(u => u.country))).sort(),
    [universities]
  );

  const filtered = useMemo(() => {
    return universities.filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.city?.toLowerCase().includes(search.toLowerCase())) return false;
      if (country && u.country !== country) return false;
      if (type && u.type !== type) return false;
      if (status && u.status !== status) return false;
      return true;
    });
  }, [universities, search, country, type, status]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-64 flex-shrink-0">
        <UniversityFilters
          search={search} onSearch={setSearch}
          country={country} onCountry={setCountry}
          type={type} onType={setType}
          status={status} onStatus={setStatus}
          countries={countries}
        />
      </aside>
      <div className="flex-1">
        {filtered.length === 0 ? (
          <p className="text-muted-e py-12 text-center">{t('noResults')}</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(u => <UniversityCard key={u.id} university={u} locale={locale} />)}
          </div>
        )}
      </div>
    </div>
  );
}
