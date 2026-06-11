import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('hero');
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: 'linear-gradient(135deg, #0d7377 0%, #14b8a6 100%)' }}
    >
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-32 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full bg-white/5" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pt-24 pb-32 text-center">
        <div className="inline-block bg-white/10 backdrop-blur-sm text-teal-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
          Xorijda ta&#39;lim maslahatchisi
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
          {t('headline')}
        </h1>
        <p className="text-lg md:text-xl text-teal-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t('subheadline')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://t.me/jamshidmurodboev"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-teal-800 px-8 py-4 rounded-xl font-semibold hover:bg-teal-50 transition shadow-lg hover:shadow-xl text-base"
          >
            {t('cta')}
          </a>
          <a
            href="https://wa.me/998901234567"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition text-base"
          >
            {t('ctaWhatsApp')}
          </a>
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="w-full h-12 md:h-16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </section>
  );
}
