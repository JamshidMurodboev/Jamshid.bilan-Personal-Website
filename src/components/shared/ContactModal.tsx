'use client';
import { useTranslations } from 'next-intl';
import ContactForm from './ContactForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedTarget?: string;
}

export default function ContactModal({ isOpen, onClose, preselectedTarget }: Props) {
  const t = useTranslations('contact');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-card rounded-3xl shadow-2xl shadow-black/20 w-full max-w-md p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border border-line text-muted-e hover:border-accent hover:text-accent transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="font-display text-2xl text-heading mb-6">{t('title')}</h2>
        <ContactForm preselectedTarget={preselectedTarget} />
      </div>
    </div>
  );
}
