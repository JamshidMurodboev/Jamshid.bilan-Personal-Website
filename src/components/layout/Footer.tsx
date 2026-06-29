import { useTranslations } from 'next-intl';

const SOCIALS = [
  {
    href: 'https://t.me/turkiya_burslari_jamshid_bilan',
    label: 'Telegram',
    bg: 'bg-[#2AABEE]',
    icon: (
      <path d="M21.05 3.27 2.7 10.62c-1.25.5-1.24 1.2-.23 1.51l4.7 1.47 1.83 5.6c.22.6.37.84.76.84.3 0 .43-.14.6-.3l2.5-2.4 4.78 3.53c.88.49 1.5.24 1.72-.81L21.94 4.4c.3-1.28-.49-1.85-1.4-1.13Z" fill="white" />
    ),
  },
  {
    href: 'https://www.instagram.com/jamshid.bilan',
    label: 'Instagram',
    bg: 'bg-gradient-to-br from-[#E1306C] via-[#F77737] to-[#FCAF45]',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="white" />
      </>
    ),
  },
  {
    href: 'https://youtube.com/@jamshidbilan',
    label: 'YouTube',
    bg: 'bg-[#FF0000]',
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M10 9.5v5l4.5-2.5z" fill="white" />
      </>
    ),
  },
];

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
