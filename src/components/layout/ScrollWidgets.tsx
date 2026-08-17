'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ScrollWidgets() {
  const pathname = usePathname();
  const t = useTranslations('contact');
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
    function onScroll() {
      const hero = document.getElementById('hero');
      const threshold = hero ? hero.offsetHeight - 100 : window.innerHeight * 0.6;
      setPastHero(window.scrollY > threshold);

      const contact = document.getElementById('contact');
      if (contact) {
        const rect = contact.getBoundingClientRect();
        setAtContact(rect.top < window.innerHeight * 0.6 && rect.bottom > 0);
      } else {
        setAtContact(false);
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  if (!pastHero) return null;

  const showCta = isHome && !atContact;

  return (
    <>
      {showCta && (
        <button
          onClick={scrollToContact}
          className="btn-ink fixed bottom-6 right-6 z-40 !px-5 !py-3 text-sm"
        >
          {t('title')} →
        </button>
      )}

      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed right-6 z-40 rounded-full border border-line bg-page/80 backdrop-blur-sm text-heading hover:border-accent hover:text-accent flex items-center justify-center transition-all duration-300 w-11 h-11 md:w-10 md:h-10 ${
          showCta ? 'bottom-24' : 'bottom-6'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
