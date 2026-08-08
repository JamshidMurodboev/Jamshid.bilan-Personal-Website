import { setRequestLocale } from 'next-intl/server';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import StatsBanner from '@/components/home/StatsBanner';
import HomeContactSection from '@/components/home/HomeContactSection';
import FaqSection from '@/components/home/FaqSection';
import HomeSectionsPreview from '@/components/home/HomeSectionsPreview';
import ProcessSection from '@/components/home/ProcessSection';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <>
      <HeroSection />
      <StatsBanner />
      <AboutSection />
      <ProcessSection />
      <HomeSectionsPreview locale={locale} />
      <FaqSection />
      <HomeContactSection />
    </>
  );
}
