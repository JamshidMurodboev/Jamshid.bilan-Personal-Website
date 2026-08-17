import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const SECTIONS = [
  { href: '/scholarships', key: 'scholarships' },
  { href: '/universities', key: 'universities' },
  { href: '/results', key: 'results' },
  { href: '/news', key: 'news' },
];

export default function TeaserSection() {
  const locale = useLocale();
  const t = useTranslations('homeSections');

  return (
    <section id="services" className="section-pad bg-soft border-y border-line">
      <div className="container-page">
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {SECTIONS.map((s) => (
            <div key={s.href} className="card-e p-8 flex flex-col">
              <h2 className="font-display text-2xl text-heading mb-2 leading-snug">{t(`${s.key}.title`)}</h2>
              <p className="text-sm text-body leading-relaxed mb-6">{t(`${s.key}.subtitle`)}</p>
              <Link
                href={`/${locale}${s.href}`}
                className="arrow-link text-xs uppercase tracking-widest mt-auto"
              >
                {t(`${s.key}.title`)}<span className="arr">→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
