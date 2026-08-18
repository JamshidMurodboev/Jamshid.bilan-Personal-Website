'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

interface DeadlineItem {
  id: string;
  source_type: 'scholarship' | 'university';
  source_id: string;
  active: boolean;
  title: string;
  deadline_date: string;
  url: string | null;
}

const MONTHS = {
  uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
  ru: ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const months = MONTHS[locale as keyof typeof MONTHS] || MONTHS.uz;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function daysLeft(dateStr: string): number {
  const deadline = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / 86400000);
}

export default function DeadlinesSection() {
  const locale = useLocale();
  const t = useTranslations('deadlines');
  const [items, setItems] = useState<DeadlineItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const sb = createClient();
      const { data: dl, error } = await sb.from('scholarship_deadlines').select('*').eq('active', true);
      if (error || !dl || dl.length === 0) { setLoaded(true); return; }

      const schIds = dl.filter((d: any) => d.source_type === 'scholarship').map((d: any) => d.source_id);
      const uniIds = dl.filter((d: any) => d.source_type === 'university').map((d: any) => d.source_id);

      const [scRes, unRes] = await Promise.all([
        schIds.length ? sb.from('scholarships').select('id,title,title_uz,title_ru,title_en,close_date,application_url').in('id', schIds) : Promise.resolve({ data: [] }),
        uniIds.length ? sb.from('universities').select('id,name,name_ru,name_en,website_url').in('id', uniIds) : Promise.resolve({ data: [] }),
      ]);

      const scMap = Object.fromEntries((scRes.data || []).map((s: any) => [s.id, s]));
      const unMap = Object.fromEntries((unRes.data || []).map((u: any) => [u.id, u]));

      const enriched = dl.map((d: any): DeadlineItem | null => {
        // Use the stored deadline_date first, fallback to scholarship close_date
        if (d.source_type === 'scholarship') {
          const s = scMap[d.source_id] || {};
          const deadline = d.deadline_date || s.close_date;
          if (!deadline) return null;
          const title = s[`title_${locale}`] || s.title_uz || s.title || d.source_id;
          return { id: d.id, source_type: 'scholarship', source_id: d.source_id, active: true, title, deadline_date: deadline, url: s.application_url || null };
        } else {
          const u = unMap[d.source_id] || {};
          const deadline = d.deadline_date;
          if (!deadline) return null;
          const title = (locale !== 'uz' ? u[`name_${locale}`] : null) || u.name || d.source_id;
          return { id: d.id, source_type: 'university', source_id: d.source_id, active: true, title, deadline_date: deadline, url: u.website_url || null };
        }
      }).filter((d): d is DeadlineItem => d !== null);

      setItems(enriched);
      setLoaded(true);
    }
    load();
  }, [locale]);

  if (!loaded || items.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-[#f0f9f8] dark:bg-[#0d1117]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {items.map(item => {
            const days = daysLeft(item.deadline_date);
            const ended = days < 0;
            const urgent = days >= 0 && days <= 7;
            const today = days === 0;
            return (
              <div key={item.id} className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{item.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 flex-shrink-0">
                    {item.source_type === 'scholarship' ? '🎓' : '🏛️'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.deadline_date, locale)}</p>
                <p className={`text-sm font-bold ${ended ? 'text-gray-400' : urgent ? 'text-red-500 dark:text-red-400' : 'text-teal-700 dark:text-teal-400'}`}>
                  {ended ? t('ended') : today ? t('today') : t('daysLeft', { days })}
                </p>
                {item.url && !ended && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="mt-auto text-center text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white py-2 rounded-xl transition">
                    {t('apply')}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
