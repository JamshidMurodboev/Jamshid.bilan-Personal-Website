'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const LOCALES = [
  { code: 'uz', label: "O'z" },
  { code: 'ru', label: 'Ру' },
  { code: 'en', label: 'En' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  }

  return (
    <div className="flex gap-1">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          className={`px-2.5 py-1 text-xs font-bold uppercase tracking-widest rounded-full transition-colors ${
            locale === l.code ? 'bg-ink text-[var(--bg)]' : 'text-muted-e hover:text-accent'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
