'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AuthModal from '@/components/auth/AuthModal';

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
      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      {dark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
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
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`w-full text-left px-4 py-2.5 text-sm transition ${
                locale === l.code
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
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
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-teal-500 hover:opacity-80 transition flex items-center justify-center bg-teal-100 dark:bg-teal-900"
      >
        {user.photoDataUrl
          ? <img src={user.photoDataUrl} alt={user.fullName} className="w-full h-full object-cover" />
          : <span className="text-xs font-bold text-teal-700 dark:text-teal-300">{initials}</span>
        }
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <p className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 truncate">{user.fullName}</p>
          <Link
            href={`/${locale}/profile`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >{t('profile')}</Link>
          <button
            onClick={() => { logout(); setOpen(false); router.push(`/${locale}`); }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
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
  const callbackUrl = searchParams.get('callbackUrl');

  useEffect(() => {
    if (searchParams.get('auth') === 'signin') {
      setAuthModal({ open: true, tab: 'signin' });
    }
  }, [searchParams]);

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
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
    <>
      <header className="bg-white/90 dark:bg-[#0d1117]/90 dark:backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="font-bold text-[#0d9488] dark:text-[#2dd4bf] text-lg">
            Jamshid.bilan
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-700 dark:hover:text-teal-400 transition"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <LanguageDropdown />
              <ThemeToggle />
              {user ? (
                <AvatarMenu />
              ) : (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => setAuthModal({ open: true, tab: 'signin' })}
                    className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-700 dark:hover:text-teal-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >{tAuth('signIn')}</button>
                  <button
                    onClick={() => setAuthModal({ open: true, tab: 'signup' })}
                    className="text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition"
                  >{tAuth('signUp')}</button>
                </div>
              )}
            </div>
          </nav>

          <div className="md:hidden flex items-center gap-1">
            <LanguageDropdown />
            <ThemeToggle />
            {user ? <AvatarMenu /> : (
              <button
                onClick={() => setAuthModal({ open: true, tab: 'signin' })}
                className="text-sm font-medium text-teal-700 dark:text-teal-400 px-2 py-1.5"
              >{tAuth('signIn')}</button>
            )}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setOpen(!open)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-700 dark:text-gray-200 py-2 hover:text-teal-700 dark:hover:text-teal-400 transition"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => { setOpen(false); setAuthModal({ open: true, tab: 'signin' }); }}
                  className="flex-1 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >{tAuth('signIn')}</button>
                <button
                  onClick={() => { setOpen(false); setAuthModal({ open: true, tab: 'signup' }); }}
                  className="flex-1 text-sm font-semibold bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition"
                >{tAuth('signUp')}</button>
              </div>
            )}
          </div>
        )}
      </header>
      <AuthModal
        isOpen={authModal.open}
        onClose={handleAuthClose}
        initialTab={authModal.tab}
      />
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
