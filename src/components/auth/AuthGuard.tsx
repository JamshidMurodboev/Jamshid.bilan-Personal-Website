'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('auth');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.replace(`/${locale}?auth=signin&callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, user, locale, pathname, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9f8] dark:bg-[#0d1117] px-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('loginRequiredDesc')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
