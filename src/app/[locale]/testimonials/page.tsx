'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import PageNav from '@/components/shared/PageNav';
import type { Testimonial } from '@/lib/supabase/types';

export default function TestimonialsPage() {
  const locale = useLocale();
  const t = useTranslations('testimonials');
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push(`/${locale}?auth=signin&callbackUrl=/${locale}/testimonials`);
      return;
    }
    createClient()
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data as Testimonial[]);
      });
  }, [mounted, user, locale, router]);

  function field(item: Testimonial, base: 'quote' | 'outcome') {
    return (item as any)[`${base}_${locale}`] || (item as any)[`${base}_uz`];
  }

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageNav />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('subtitle')}</p>

        {items.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Hozircha fikrlar yo'q.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link key={item.id} href={`/${locale}/testimonials/${item.id}`} className="block h-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition h-full flex flex-col justify-between">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 line-clamp-5">&ldquo;{field(item, 'quote')}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-auto">
                    {item.photo_url ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={item.photo_url} alt={item.student_name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold flex-shrink-0">
                        {item.student_name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.student_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{field(item, 'outcome')}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
