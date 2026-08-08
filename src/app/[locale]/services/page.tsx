'use client';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth';
import FavouriteButton from '@/components/shared/FavouriteButton';
import PageNav from '@/components/shared/PageNav';
import type { Service } from '@/lib/supabase/types';

function priceDisplay(s: Service, t: (k: string) => string) {
  if (s.currency === 'FREE') return t('free');
  if (!s.price) return '';
  const cur = s.currency === 'OTHER' ? (s.currency_custom || '') : (s.currency || '');
  return `${s.price.toLocaleString()} ${cur}`;
}

export default function ServicesPage() {
  const locale = useLocale();
  const t = useTranslations('services');
  const tAuth = useTranslations('auth');
  const tc = useTranslations('common');
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    createClient().from('services').select('*').eq('status', 'active').order('home_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setServices(data as Service[]); setLoading(false); });
  }, [mounted]);

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t('loginRequired')}</p>
          <Link href={`/${locale}?auth=signin`} className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold transition">
            {tAuth('signIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav backHref={`/${locale}`} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pageTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('pageSubtitle')}</p>
        {loading ? (
          <div className="text-teal-700 dark:text-teal-400 animate-pulse">{tc('loading')}</div>
        ) : services.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">{tc('noResults')}</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(s => {
              const name = (s as any)[`name_${locale}`] || s.name_uz;
              const description = (s as any)[`description_${locale}`] || s.description_uz || '';
              const price = priceDisplay(s, t);
              return (
                <Link key={s.id} href={`/${locale}/services/${s.slug ?? s.id}`} className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700 flex flex-col">
                  <FavouriteButton entityType="service" entityId={s.id} className="absolute top-2 right-2 z-10" />
                  {s.photo_url ? (
                    <div className="relative w-full aspect-[4/3]">
                      <Image src={s.photo_url} alt={name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-5xl">🎯</div>
                  )}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">{name}</h3>
                    {price && (
                      <span className="text-sm font-medium text-teal-700 dark:text-teal-400">{price}</span>
                    )}
                    {description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
