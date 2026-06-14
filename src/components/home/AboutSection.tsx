import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AboutSection() {
  const t = useTranslations('about');
  const credentials = t.raw('credentials') as string[];
  return (
    <section className="py-16 px-4 bg-amber-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{t('body')}</p>
          <ul className="space-y-3">
            {credentials.map((c: string) => (
              <li key={c} className="flex items-start gap-3 text-gray-700 dark:text-gray-200">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-700">
            <Image
              src="/copy_0659112A-3990-4AFC-A553-6B9CF1B3E78C.jpeg"
              alt="Jamshid Murodboev"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
