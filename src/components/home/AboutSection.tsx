'use client';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DbAbout {
  body: string | null;
  credentials: string[] | null;
  photo_url: string | null;
}

export default function AboutSection() {
  const t = useTranslations('about');
  const locale = useLocale();
  const fallbackCredentials = t.raw('credentials') as string[];
  const [db, setDb] = useState<DbAbout | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('about_content')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) {
          const creds = data[`credentials_${locale}`] as string[];
          setDb({
            body: (data[`body_${locale}`] as string) || null,
            credentials: creds?.length ? creds : null,
            photo_url: data.photo_url || null,
          });
        }
      });
  }, [locale]);

  const body = db?.body || t('body');
  const credentials = db?.credentials || fallbackCredentials;
  const photo = db?.photo_url || '/copy_0659112A-3990-4AFC-A553-6B9CF1B3E78C.jpeg';

  return (
    <section id="about" className="py-24 md:py-32 px-4 bg-white dark:bg-[#0d1117] relative">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h2 className="text-[2.25rem] md:text-[2.5rem] font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h2>
          <p className="text-[17px] md:text-[18px] leading-[1.8] text-gray-600 dark:text-gray-300 mb-8">{body}</p>
          <ul className="space-y-4">
            {credentials.map((c: string) => (
              <li key={c} className="flex items-start gap-3 text-[17px] md:text-[18px] leading-[1.8] text-gray-700 dark:text-gray-200">
                <span className="flex-shrink-0 w-7 h-7 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  ✓
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40 border-4 border-white dark:border-gray-700">
            <Image
              src={photo}
              alt="Jamshid Murodboev"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
