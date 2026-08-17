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
    <section className="section-pad">
      <div className="container-page">
        <div className="mb-12">
          <p className="eyebrow mb-4">04</p>
          <h2 className="display text-4xl sm:text-5xl">{t('title')}</h2>
        </div>

        {/* Editorial deadline ledger */}
        <div className="border-t border-line">
          {items.map(item => {
            const days = daysLeft(item.deadline_date);
            const ended = days < 0;
            const urgent = days >= 0 && days <= 7;
            const today = days === 0;
            return (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-8 py-5 border-b border-line">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e sm:w-44 flex-shrink-0">
                  {formatDate(item.deadline_date, locale)}
                </span>
                <p className={`font-display text-lg leading-snug flex-1 ${ended ? 'text-muted-e' : 'text-heading'}`}>
                  {item.title}
                </p>
                <span className={`text-sm font-semibold whitespace-nowrap ${ended ? 'text-muted-e' : urgent ? 'text-accent' : 'text-body'}`}>
                  {ended ? t('ended') : today ? t('today') : t('daysLeft', { days })}
                </span>
                {item.url && !ended && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="arrow-link text-xs uppercase tracking-widest whitespace-nowrap"
                  >
                    {t('apply')}<span className="arr">→</span>
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
