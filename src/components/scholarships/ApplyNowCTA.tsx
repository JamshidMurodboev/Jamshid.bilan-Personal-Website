'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import TelegramContactButton from '@/components/contact/TelegramContactButton';

export default function ApplyNowCTA({ scholarshipTitle }: { scholarshipTitle: string }) {
  const t = useTranslations('scholarships');
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-2xl text-base font-bold transition shadow-lg shadow-teal-900/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('applyNow')}
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{t('chooseContact')}</p>
          <div className="flex flex-wrap gap-3">
            <TelegramContactButton
              platform="telegram"
              scholarshipContext={scholarshipTitle}
              className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.152.678-.554.843-1.123.524l-3.1-2.284-1.497 1.44c-.165.165-.304.304-.624.304l.223-3.165 5.757-5.197c.25-.223-.054-.347-.389-.124L6.838 14.04l-3.054-.953c-.664-.208-.678-.664.138-.982l11.931-4.6c.554-.2 1.04.138.709.743z"/></svg>
              {t('contactTelegram')}
            </TelegramContactButton>
            <TelegramContactButton
              platform="whatsapp"
              scholarshipContext={scholarshipTitle}
              className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20b956] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t('contactWhatsApp')}
            </TelegramContactButton>
          </div>
        </div>
      )}
    </div>
  );
}
