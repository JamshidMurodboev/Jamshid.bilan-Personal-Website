import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const SECTIONS = [
  { href: '/scholarships', key: 'scholarships', emoji: '🎓', bg: 'bg-[#f0f9f8] dark:bg-[#0d1117]' },
  { href: '/universities', key: 'universities', emoji: '🏫', bg: 'bg-white dark:bg-[#161b22]' },
  { href: '/results', key: 'results', emoji: '🏆', bg: 'bg-[#f0f9f8] dark:bg-[#0d1117]' },
  { href: '/news', key: 'news', emoji: '📰', bg: 'bg-white dark:bg-[#161b22]' },
];

export default function TeaserSection() {
  const locale = useLocale();
  const t = useTranslations('homeSections');

  return (
    <>
      {SECTIONS.map((s) => (
        <section key={s.href} className={`py-16 px-4 ${s.bg}`}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#ccfbf1] dark:bg-[#0d2d2a] text-[#0f766e] dark:text-[#2dd4bf] flex items-center justify-center text-3xl mx-auto mb-5">
              {s.emoji}
            </div>
            <h2 className="text-[2rem] font-bold text-[#0f172a] dark:text-[#e6edf3] mb-2">{t(`${s.key}.title`)}</h2>
            <p className="text-[#64748b] dark:text-[#8b949e] mb-6">{t(`${s.key}.subtitle`)}</p>
            <Link
              href={`/${locale}${s.href}`}
              className="inline-block bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-2.5 rounded-xl font-semibold transition"
            >
              {t(`${s.key}.title`)}
            </Link>
          </div>
        </section>
      ))}
    </>
  );
}
