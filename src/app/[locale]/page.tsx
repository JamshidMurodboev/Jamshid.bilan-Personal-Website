import { setRequestLocale } from 'next-intl/server';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import StatsBanner from '@/components/home/StatsBanner';
import TeaserSection from '@/components/home/TeaserSection';
import HomeContactSection from '@/components/home/HomeContactSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <>
      <HeroSection />
      <StatsBanner />
      <AboutSection />
      <TestimonialsSection />
      <TeaserSection />
      <HomeContactSection />
    </>
  );
}
