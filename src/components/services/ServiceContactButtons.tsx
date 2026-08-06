'use client';
import { useState } from 'react';
import ContactModal from '@/components/shared/ContactModal';
import AskQuestionButton from '@/components/shared/AskQuestionButton';

interface Props {
  serviceContext: string;
  applyLabel: string;
  askLabel: string;
}

export default function ServiceContactButtons({ serviceContext, applyLabel, askLabel }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-xl font-semibold transition"
      >
        {applyLabel}
      </button>
      <AskQuestionButton
        serviceContext={serviceContext}
        className="inline-flex items-center gap-2 border-2 border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-6 py-3 rounded-xl font-semibold text-sm transition"
      >
        {askLabel}
      </AskQuestionButton>
      <ContactModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
