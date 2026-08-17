'use client';
import { useTranslations } from 'next-intl';
import TelegramContactButton from '@/components/contact/TelegramContactButton';
import AskQuestionButton from '@/components/shared/AskQuestionButton';

export default function ApplyNowCTA({ scholarshipTitle }: { scholarshipTitle: string }) {
  const t = useTranslations('scholarships');
  const tc = useTranslations('contact.form');

  return (
    <div className="mb-12 flex flex-col sm:flex-row flex-wrap gap-3">
      <TelegramContactButton
        platform="telegram"
        scholarshipContext={scholarshipTitle}
        className="w-full sm:w-auto btn-accent"
      >
        {t('applyNow')}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </TelegramContactButton>
      <AskQuestionButton
        scholarshipContext={scholarshipTitle}
        className="w-full sm:w-auto btn-ghost"
      >
        {tc('askQuestion')}
      </AskQuestionButton>
    </div>
  );
}
