import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('hero');
  return (
    <section className="bg-gradient-to-br from-teal-800 to-teal-600 text-white py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{t('headline')}</h1>
        <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-2xl mx-auto">{t('subheadline')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://t.me/jamshidmurodboev" target="_blank" rel="noopener noreferrer"
            className="bg-white text-teal-800 px-8 py-3 rounded-xl font-semibold hover:bg-teal-50 transition">
            {t('cta')}
          </a>
          <a href="https://wa.me/998901234567" target="_blank" rel="noopener noreferrer"
            className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition">
            {t('ctaWhatsApp')}
          </a>
        </div>
      </div>
    </section>
  );
}
