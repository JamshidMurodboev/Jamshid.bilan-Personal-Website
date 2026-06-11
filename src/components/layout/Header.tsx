'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { useState } from 'react';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${locale}/scholarships`, label: t('scholarships') },
    { href: `/${locale}/universities`, label: t('universities') },
    { href: `/${locale}/results`, label: t('results') },
    { href: `/${locale}/news`, label: t('news') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href={`/${locale}`} className="font-bold text-teal-700 text-lg">Jamshid Murodboev</Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-700 hover:text-teal-700 transition">{l.label}</Link>
          ))}
          <LanguageSwitcher />
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-gray-700"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
            <span className="block w-6 h-0.5 bg-gray-700"></span>
          </div>
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-700">{l.label}</Link>
          ))}
          <LanguageSwitcher />
        </div>
      )}
    </header>
  );
}
