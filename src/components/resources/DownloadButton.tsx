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
      <span className="inline-block text-xs text-gray-500 dark:text-gray-400 italic">
        {t('loginToDownload')}
      </span>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {t('download')}
    </a>
  );
}
