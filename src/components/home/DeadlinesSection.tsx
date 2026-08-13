'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

interface Deadline {
  id: string;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  deadline_date: string;
  link?: string;
  active: boolean;
}

const MONTHS = {
  uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],
  ru: ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};

function formatDeadlineDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  const months = MONTHS[locale as keyof typeof MONTHS] || MONTHS.uz;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getDaysLeft(dateStr: string): number {
  const deadline = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DeadlinesSection() {
  const locale = useLocale();
  const t = useTranslations('deadlines');
  const [items, setItems] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('scholarship_deadlines')
      .select('*')
      .eq('active', true)
      .order('deadline_date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setItems(data as Deadline[]);
        setLoading(false);
      });
  }, []);

  if (loading || items.length === 0) return null;

  function getTitle(item: Deadline) {
    return (item as any)[`title_${locale}`] || item.title_uz;
  }

  return (
    <section className="py-12 px-4 bg-[#f0f9f8] dark:bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-[#0f172a] dark:text-[#e6edf3] mb-6">{t('title')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">
          {items.map((item) => {
            const daysLeft = getDaysLeft(item.deadline_date);
            const ended = daysLeft < 0;
            const urgent = !ended && daysLeft <= 7;

            return (
              <div
                key={item.id}
                className="flex-shrink-0 w-64 md:w-auto bg-white dark:bg-[#161b22] rounded-xl border border-[#e2e8f0] dark:border-[#21262d] p-4 flex flex-col gap-3"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{getTitle(item)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDeadlineDate(item.deadline_date, locale)}</p>
                {ended ? (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t('ended')}</span>
                ) : daysLeft === 0 ? (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">{t('today')}</span>
                ) : (
                  <span className={`text-xs font-bold ${urgent ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-400'}`}>
                    {t('daysLeft', { days: daysLeft })}
                  </span>
                )}
                {item.link && !ended && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto text-center text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition"
                  >
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
