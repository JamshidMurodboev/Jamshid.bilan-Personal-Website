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
    <section id="about" className="py-16 px-4 bg-white dark:bg-[#0d1117] relative">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{body}</p>
          <ul className="space-y-3">
            {credentials.map((c: string) => (
              <li key={c} className="flex items-start gap-3 text-gray-700 dark:text-gray-200">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  ✓
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-700">
            <Image
              src={photo}
              alt="Jamshid Murodboev"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 translate-y-full pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" className="fill-[#e6fffa] dark:fill-[#102a43]" />
        </svg>
      </div>
    </section>
  );
}
