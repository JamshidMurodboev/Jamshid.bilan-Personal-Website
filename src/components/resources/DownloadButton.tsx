'use client';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';

interface DownloadButtonProps {
  fileUrl: string;
}

export default function DownloadButton({ fileUrl }: DownloadButtonProps) {
  const { user } = useAuth();
  const t = useTranslations('resources');

  if (!user) {
    return (
      <span className="inline-block text-xs text-muted-e italic">
        {t('loginToDownload')}
      </span>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-ghost px-5 py-2.5 text-xs"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {t('download')}
    </a>
  );
}
