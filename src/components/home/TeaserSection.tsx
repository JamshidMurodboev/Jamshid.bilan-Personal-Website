import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function TeaserSection() {
  const locale = useLocale();
  const ts = useTranslations('sections');
  const tt = useTranslations('teasers');

  const services = [
    { href: '/scholarships', key: 'scholarships', emoji: '🎓', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { href: '/universities', key: 'universities', emoji: '🏫', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  ];

  const newsItems = [
    { href: '/results', key: 'results', emoji: '🏆', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' },
    { href: '/blog', key: 'blog', emoji: '📝', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
  ];

  return (
    <>
      <section className="py-16 px-4 bg-[#faf7f2] dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{ts('servicesTitle')}</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {services.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition group border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${item.color}`}>
                  {item.emoji}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">{tt(`${item.key}.title`)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tt(`${item.key}.desc`)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{ts('newsTitle')}</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {newsItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition group border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${item.color}`}>
                  {item.emoji}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">{tt(`${item.key}.title`)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tt(`${item.key}.desc`)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
