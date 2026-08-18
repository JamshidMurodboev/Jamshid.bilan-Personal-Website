'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface Props {
  homeHref?: string;
  backHref?: string;
}

export default function PageNav({ homeHref, backHref }: Props) {
  const locale = useLocale();
  const t = useTranslations('common');

  return (
    <div className="flex items-center gap-3 mb-6">
      <Link
        href={backHref ?? `/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <Link
        href={homeHref ?? `/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21H15v-6H9v6H3V9.75z" />
        </svg>
        {t('home')}
      </Link>
    </div>
  );
}
