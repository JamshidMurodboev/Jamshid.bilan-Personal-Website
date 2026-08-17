import { useTranslations } from 'next-intl';
import { SOCIALS } from '@/lib/socials';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-10">
          <div>
            <p className="font-display text-4xl sm:text-5xl text-heading tracking-tight mb-3">
              Jamshid<span className="text-accent">.</span>bilan
            </p>
            <p className="text-sm text-muted-e max-w-xs">{t('follow')}</p>
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-line text-heading hover:border-accent hover:text-accent hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="rule mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-e">
          <p>© {new Date().getFullYear()} Jamshid Murodboev. {t('rights')}</p>
          <p className="uppercase tracking-[0.2em]">Tashkent ✦ Ankara ✦ Worldwide</p>
        </div>
      </div>
    </footer>
  );
}
