'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AuthModal from '@/components/auth/AuthModal';
import ContactModal from '@/components/shared/ContactModal';

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-9 h-9 flex items-center justify-center rounded-full text-muted-e hover:text-accent transition-colors"
    >
      {dark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

function LanguageDropdown() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const LOCALES = [
    { code: 'uz', label: "O'zbek" },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function getCurrentSectionId() {
    const sections = document.querySelectorAll('section[id]');
    let closestId: string | null = null;
    let closestDist = Infinity;
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        const dist = Math.abs(rect.top);
        if (dist < closestDist) { closestDist = dist; closestId = s.id; }
      }
    });
    return closestId;
  }

  function switchLocale(newLocale: string) {
    const sectionId = getCurrentSectionId();
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(sectionId ? `${newPath}#${sectionId}` : newPath);
    localStorage.setItem('locale', newLocale);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Switch language"
        className="h-9 px-2.5 flex items-center gap-1 rounded-full text-xs font-bold uppercase tracking-widest text-muted-e hover:text-accent transition-colors"
      >
        {locale}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-36 bg-card border border-card rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                locale === l.code
                  ? 'text-accent font-bold'
                  : 'text-body hover:text-heading'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AvatarMenu() {
  const { user, logout } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('auth');

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const initials = user.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden border border-line hover:border-accent transition-colors flex items-center justify-center bg-soft"
      >
        {user.photoDataUrl
          ? <img src={user.photoDataUrl} alt={user.fullName} className="w-full h-full object-cover" />
          : <span className="text-xs font-bold text-heading">{initials}</span>
        }
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-44 bg-card border border-card rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50">
          <p className="px-4 py-2.5 text-xs text-muted-e border-b border-card truncate">{user.fullName}</p>
          <Link
            href={`/${locale}/profile`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-body hover:text-heading transition-colors"
          >{t('profile')}</Link>
          <button
            onClick={async () => { await logout(); setOpen(false); router.push(`/${locale}`); }}
            className="w-full text-left px-4 py-2.5 text-sm text-accent hover:opacity-70 transition-opacity"
          >{t('logout')}</button>
        </div>
      )}
    </div>
  );
}

function HeaderInner() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { user } = useAuth();
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'signin' | 'signup' }>({ open: false, tab: 'signin' });
  const [contactOpen, setContactOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl');

  useEffect(() => {
    if (searchParams.get('auth') === 'signin') {
      setAuthModal({ open: true, tab: 'signin' });
    }
  }, [searchParams]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleAuthClose() {
    setAuthModal(prev => ({ ...prev, open: false }));
    if (user && callbackUrl) {
      router.push(callbackUrl);
    }
  }

  const links = [
    { href: `/${locale}#about`, label: t('about') },
    { href: `/${locale}/scholarships`, label: t('scholarships') },
    { href: `/${locale}/universities`, label: t('universities') },
    { href: `/${locale}/results`, label: t('results') },
    { href: `/${locale}/news`, label: t('news') },
    { href: `/${locale}/services`, label: t('services') },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-page/90 backdrop-blur-md border-b border-line'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container-page flex items-center justify-between h-[72px]">
          <Link href={`/${locale}`} className="font-display text-[22px] text-heading tracking-tight">
            Jamshid<span className="text-accent">.</span>bilan
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="link-underline text-[13px] font-semibold tracking-wide"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 ml-3 pl-5 border-l border-line">
              <LanguageDropdown />
              <ThemeToggle />
              {user ? (
                <AvatarMenu />
              ) : (
                <button
                  onClick={() => setAuthModal({ open: true, tab: 'signin' })}
                  className="text-[13px] font-semibold text-body hover:text-heading px-2 transition-colors"
                >{tAuth('signIn')}</button>
              )}
              <button
                onClick={() => setContactOpen(true)}
                className="btn-ink !px-5 !py-2.5 text-[13px]"
              >
                {t('contact')}
              </button>
            </div>
          </nav>

          <div className="lg:hidden flex items-center gap-1">
            <LanguageDropdown />
            <ThemeToggle />
            {user && <AvatarMenu />}
            <button
              aria-label="Menu"
              className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-full"
              onClick={() => setOpen(!open)}
            >
              <span className={`block w-5 h-[1.5px] bg-current text-heading transition-transform duration-300 ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-current text-heading transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-current text-heading transition-transform duration-300 ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden bg-page border-t border-line px-6 py-6 flex flex-col gap-1">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-2xl text-heading py-2 hover:text-accent transition-colors anim-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-5 mt-3 border-t border-line">
              <button
                onClick={() => { setOpen(false); setContactOpen(true); }}
                className="btn-ink flex-1"
              >
                {t('contact')}
              </button>
              {!user && (
                <button
                  onClick={() => { setOpen(false); setAuthModal({ open: true, tab: 'signin' }); }}
                  className="btn-ghost flex-1"
                >{tAuth('signIn')}</button>
              )}
            </div>
          </div>
        )}
      </header>
      <AuthModal
        isOpen={authModal.open}
        onClose={handleAuthClose}
        initialTab={authModal.tab}
      />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderInner />
    </Suspense>
  );
}
