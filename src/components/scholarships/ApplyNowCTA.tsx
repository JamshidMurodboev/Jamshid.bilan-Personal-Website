'use client';
import { useTranslations } from 'next-intl';
import TelegramContactButton from '@/components/contact/TelegramContactButton';
import AskQuestionButton from '@/components/shared/AskQuestionButton';

export default function ApplyNowCTA({ scholarshipTitle }: { scholarshipTitle: string }) {
  const t = useTranslations('scholarships');
  const tc = useTranslations('contact.form');

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <TelegramContactButton
        platform="telegram"
        scholarshipContext={scholarshipTitle}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-2xl text-base font-bold transition shadow-lg shadow-teal-900/20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {t('applyNow')}
      </TelegramContactButton>
      <AskQuestionButton
        scholarshipContext={scholarshipTitle}
        className="w-full sm:w-auto inline-flex items-center gap-2 border-2 border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-6 py-3 rounded-xl font-semibold text-sm transition"
      >
        {tc('askQuestion')}
      </AskQuestionButton>
    </div>
  );
}
