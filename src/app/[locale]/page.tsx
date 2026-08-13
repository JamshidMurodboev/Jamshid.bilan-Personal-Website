import { setRequestLocale } from 'next-intl/server';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import StatsBanner from '@/components/home/StatsBanner';
import HomeContactSection from '@/components/home/HomeContactSection';
import FaqSection from '@/components/home/FaqSection';
import HomeSectionsPreview from '@/components/home/HomeSectionsPreview';
import ProcessSection from '@/components/home/ProcessSection';
import DeadlinesSection from '@/components/home/DeadlinesSection';
import CommunitySection from '@/components/home/CommunitySection';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <>
      <HeroSection />
      <StatsBanner />
      <AboutSection />
      <ProcessSection />
      <DeadlinesSection />
      <CommunitySection locale={locale} />
      <HomeSectionsPreview locale={locale} />
      <FaqSection />
      <HomeContactSection />
    </>
  );
}
