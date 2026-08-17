'use client';
import { useState } from 'react';
import ContactModal from '@/components/shared/ContactModal';
import AskQuestionButton from '@/components/shared/AskQuestionButton';

interface Props {
  serviceContext: string;
  applyLabel: string;
  askLabel: string;
  preselectedTarget?: string;
}

export default function ServiceContactButtons({ serviceContext, applyLabel, askLabel, preselectedTarget }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap gap-3 mt-6 mb-8">
      <button onClick={() => setOpen(true)} className="btn-accent">
        {applyLabel}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      <AskQuestionButton serviceContext={serviceContext} className="btn-ghost">
        {askLabel}
      </AskQuestionButton>
      <ContactModal isOpen={open} onClose={() => setOpen(false)} preselectedTarget={preselectedTarget} />
    </div>
  );
}
