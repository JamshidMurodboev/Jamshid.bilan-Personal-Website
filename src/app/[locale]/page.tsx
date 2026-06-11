import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import StatsBanner from '@/components/home/StatsBanner';
import TeaserSection from '@/components/home/TeaserSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBanner />
      <AboutSection />
      <TeaserSection />
    </>
  );
}
