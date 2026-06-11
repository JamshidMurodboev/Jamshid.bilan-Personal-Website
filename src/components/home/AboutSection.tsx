import { useTranslations } from 'next-intl';

export default function AboutSection() {
  const t = useTranslations('about');
  const credentials = t.raw('credentials') as string[];
  return (
    <section className="py-20 px-4" style={{ background: '#fdf8f0' }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Men haqimda
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">{t('title')}</h2>
          <p className="text-gray-600 leading-relaxed mb-8 text-base">{t('body')}</p>
          <ul className="space-y-3">
            {credentials.map((c: string) => (
              <li key={c} className="flex items-start gap-3 text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  &#10003;
                </span>
                <span className="text-base">{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-teal-200 rounded-3xl rotate-3" />
          <div className="relative bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl h-72 md:h-96 flex items-center justify-center shadow-lg">
            <div className="text-center text-teal-500">
              <div className="text-6xl mb-3">👨‍💼</div>
              <p className="text-sm font-medium text-teal-700">Jamshid Murodboev</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
