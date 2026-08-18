import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const SECTIONS = [
  { href: '/scholarships', key: 'scholarships', emoji: '🎓' },
  { href: '/universities', key: 'universities', emoji: '🏫' },
  { href: '/results', key: 'results', emoji: '🏆' },
  { href: '/news', key: 'news', emoji: '📰' },
];

export default function TeaserSection() {
  const locale = useLocale();
  const t = useTranslations('homeSections');

  return (
    <section id="services" className="py-16 px-4 bg-[#e6fffa] dark:bg-[#102a43]">
      <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
        {SECTIONS.map((s) => (
          <div
            key={s.href}
            className="bg-white dark:bg-[#161b22] rounded-2xl p-6 shadow-sm border border-[#e2e8f0] dark:border-[#21262d] flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#ccfbf1] dark:bg-[#0d2d2a] text-[#0f766e] dark:text-[#2dd4bf] flex items-center justify-center text-3xl mb-4">
              {s.emoji}
            </div>
            <h2 className="text-[1.25rem] font-semibold text-[#0f172a] dark:text-[#e6edf3] mb-1">{t(`${s.key}.title`)}</h2>
            <p className="text-sm text-[#64748b] dark:text-[#8b949e] mb-5">{t(`${s.key}.subtitle`)}</p>
            <Link
              href={`/${locale}${s.href}`}
              className="mt-auto inline-block bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              {t(`${s.key}.title`)}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
