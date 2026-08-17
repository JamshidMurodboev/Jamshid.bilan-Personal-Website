'use client';
import { useTranslations } from 'next-intl';
import TelegramContactButton from '@/components/contact/TelegramContactButton';
import AskQuestionButton from '@/components/shared/AskQuestionButton';

export default function UniversityApplyCTA({ universityName }: { universityName: string }) {
  const t = useTranslations('universities');
  const tc = useTranslations('contact.form');

  return (
    <div className="mb-8 flex flex-col sm:flex-row flex-wrap gap-3">
      <TelegramContactButton
        platform="telegram"
        universityContext={universityName}
        className="btn-accent w-full sm:w-auto"
      >
        {t('applyNow')}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </TelegramContactButton>
      <AskQuestionButton
        universityContext={universityName}
        className="btn-ghost w-full sm:w-auto"
      >
        {tc('askQuestion')}
      </AskQuestionButton>
    </div>
  );
}
