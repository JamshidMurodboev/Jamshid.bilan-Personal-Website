'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const SECTION_IDS = ['hero', 'about', 'testimonials', 'services', 'contact'];

export default function ScrollWidgets() {
  const pathname = usePathname();
  const t = useTranslations('contact');
  const [activeIndex, setActiveIndex] = useState(0);
  const [pastHero, setPastHero] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const isHome = /^\/(uz|ru|en)\/?$/.test(pathname);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'auto', block: 'start' }));
    }
  }, [pathname]);

  useEffect(() => {
    if (!isHome) return;

    function onScroll() {
      const hero = document.getElementById('hero');
      const contact = document.getElementById('contact');
      if (hero) setPastHero(window.scrollY > hero.offsetHeight - 100);
      if (contact) {
        const rect = contact.getBoundingClientRect();
        setAtContact(rect.top < window.innerHeight * 0.6 && rect.bottom > 0);
      }

      let current = 0;
      for (let i = 0; i < SECTION_IDS.length; i++) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = i;
      }
      setActiveIndex(current);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  if (!isHome) return null;

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === SECTION_IDS.length - 1;

  return (
    <>
      {pastHero && !atContact && (
        <button
          onClick={() => scrollToSection('contact')}
          className="fixed bottom-6 right-6 z-40 bg-[#0d9488] hover:bg-[#0f766e] text-white px-5 py-3 rounded-full font-semibold text-sm shadow-lg transition"
        >
          {t('title')} →
        </button>
      )}

      <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
        {!isFirst && (
          <button
            onClick={() => scrollToSection(SECTION_IDS[activeIndex - 1])}
            aria-label="Up"
            className="w-9 h-9 rounded-full bg-[#0d9488]/20 hover:bg-[#0d9488]/80 text-[#0d9488] hover:text-white flex items-center justify-center transition-colors"
          >
            ▲
          </button>
        )}
        {!isLast && (
          <button
            onClick={() => scrollToSection(SECTION_IDS[activeIndex + 1])}
            aria-label="Down"
            className="w-9 h-9 rounded-full bg-[#0d9488]/20 hover:bg-[#0d9488]/80 text-[#0d9488] hover:text-white flex items-center justify-center transition-colors"
          >
            ▼
          </button>
        )}
      </div>
    </>
  );
}
