import { useTranslations } from 'next-intl';

export default function AboutSection() {
  const t = useTranslations('about');
  const credentials = t.raw('credentials') as string[];
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{t('body')}</p>
          <ul className="space-y-2">
            {credentials.map((c: string) => (
              <li key={c} className="flex items-start gap-2 text-gray-700">
                <span className="text-teal-600 mt-1">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400">
          [Jamshid rasmi]
        </div>
      </div>
    </section>
  );
}
