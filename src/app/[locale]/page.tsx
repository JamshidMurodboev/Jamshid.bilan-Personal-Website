import { setRequestLocale } from 'next-intl/server';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import StatsBanner from '@/components/home/StatsBanner';
import TeaserSection from '@/components/home/TeaserSection';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <>
      <HeroSection />
      <StatsBanner />
      <AboutSection />
      <TeaserSection />
    </>
  );
}
