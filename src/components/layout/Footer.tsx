import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-8 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
        <p>© {new Date().getFullYear()} Jamshid Murodboev. {t('rights')}</p>
      </div>
    </footer>
  );
}
