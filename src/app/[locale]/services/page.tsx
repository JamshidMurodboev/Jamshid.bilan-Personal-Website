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
  const [fetchError, setFetchError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    Promise.resolve(
      createClient().from('services').select('*').eq('status', 'active').order('home_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false })
    )
      .then(({ data, error }) => {
        if (!error && data) setServices(data as Service[]);
        else setFetchError(true);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, [mounted]);

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center py-12 px-5">
        <div className="text-center anim-fade-up">
          <p className="text-body mb-6">{t('loginRequired')}</p>
          <Link href={`/${locale}?auth=signin`} className="btn-ink">
            {tAuth('signIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <section className="pt-10 sm:pt-14 pb-10 sm:pb-14 border-b border-line">
        <div className="container-page">
          <PageNav backHref={`/${locale}#services`} />
          <h1 className="display text-5xl sm:text-6xl mt-6 mb-4">{t('pageTitle')}</h1>
          <p className="text-lg text-body max-w-2xl">{t('pageSubtitle')}</p>
        </div>
      </section>

      <section className="container-page pt-4 pb-20 sm:pb-28">
        {loading ? (
          <div className="py-12 text-muted-e animate-pulse">{tc('loading')}</div>
        ) : fetchError ? (
          <p className="py-12 text-red-600 dark:text-red-400">{tc('error')}</p>
        ) : services.length === 0 ? (
          <p className="py-12 text-muted-e">{tc('noResults')}</p>
        ) : (
          <>
          <div>
            {services.map((s, i) => {
              const name = (s as any)[`name_${locale}`] || s.name_uz;
              const description = (s as any)[`description_${locale}`] || s.description_uz || '';
              const price = priceDisplay(s, t);
              const num = String(i + 1).padStart(2, '0');
              return (
                <Link
                  key={s.id}
                  href={`/${locale}/services/${s.slug ?? s.id}`}
                  className="group relative flex items-start sm:items-center gap-5 sm:gap-10 py-8 sm:py-10 border-b border-line"
                >
                  <span
                    className="font-display text-3xl sm:text-5xl leading-none text-muted-e transition-colors duration-300 group-hover:text-accent select-none flex-shrink-0 w-10 sm:w-16"
                    aria-hidden="true"
                  >
                    {num}
                  </span>

                  {s.photo_url && (
                    <div className="relative hidden md:block w-28 h-20 rounded-2xl overflow-hidden bg-soft flex-shrink-0">
                      <Image src={s.photo_url} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 pr-10 sm:pr-0">
                    <h3 className="font-display text-xl sm:text-2xl text-heading leading-snug mb-1.5 group-hover:text-accent transition-colors duration-300">
                      {name}
                    </h3>
                    {description && (
                      <p className="text-sm text-body line-clamp-2 max-w-xl">{description}</p>
                    )}
                    {price && (
                      <span className="sm:hidden inline-block mt-3 font-display text-lg text-heading">{price}</span>
                    )}
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
                    {price && <span className="font-display text-xl text-heading whitespace-nowrap">{price}</span>}
                    <span className="arrow-link" aria-hidden="true">
                      <span className="arr">→</span>
                    </span>
                  </div>

                  <FavouriteButton entityType="service" entityId={s.id} className="absolute top-8 right-0 z-10" />
                </Link>
              );
            })}
          </div>

          {/* Coming soon teaser */}
          <div className="mt-16 sm:mt-20 rounded-3xl border border-line bg-soft p-8 sm:p-12 text-center">
            <h2 className="font-display text-2xl sm:text-3xl text-heading mb-3">{t('comingSoonTitle')}</h2>
            <p className="text-sm text-muted-e mb-8 max-w-lg mx-auto">{t('comingSoonSubtitle')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {(t.raw('comingSoonItems') as string[]).map((item: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-card text-sm text-body font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          </>
        )}
      </section>
    </div>
  );
}
