import { useTranslations } from 'next-intl';
import { SOCIALS } from '@/lib/socials';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 text-center text-sm">
        <p className="text-sm uppercase tracking-wide text-gray-300 dark:text-gray-400">{t('follow')}</p>
        <div className="flex items-center gap-6">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={`w-[52px] h-[52px] flex items-center justify-center rounded-full ${s.bg} transition-transform duration-200 hover:scale-110`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
                {s.icon}
              </svg>
            </a>
          ))}
        </div>
        <p>© {new Date().getFullYear()} Jamshid Murodboev. {t('rights')}</p>
      </div>
    </footer>
  );
}
