'use client';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SOCIALS } from '@/lib/socials';
import { createClient } from '@/lib/supabase/client';

interface DbAbout {
  body: string | null;
  credentials: string[] | null;
  photo_url: string | null;
}

const CREDENTIAL_STYLES = [
  { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-800 dark:text-amber-300', emoji: '🏆' },
  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-800 dark:text-purple-300', emoji: '🎓' },
  { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-800 dark:text-teal-300', emoji: '🌟' },
  { bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-300 dark:border-sky-700', text: 'text-sky-800 dark:text-sky-300', emoji: '✈️' },
];

export default function AboutSection() {
  const t = useTranslations('about');
  const locale = useLocale();
  const fallbackCredentials = t.raw('credentials') as string[];
  const [db, setDb] = useState<DbAbout | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('about_content').select('*').single().then(({ data }) => {
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
  const photo = db?.photo_url || '/about-paris.jpg';

  return (
    <section id="about" className="py-24 md:py-32 px-4 bg-white dark:bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-teal-600 dark:text-teal-400 mb-3">About</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('title')}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Photo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="relative w-72 h-80 md:w-80 md:h-[420px] rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40 border-4 border-white dark:border-gray-800">
                <Image src={photo} alt="Jamshid Murodboev" fill className="object-cover" />
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-[2.2rem] border-2 border-dashed border-teal-200 dark:border-teal-800 -z-10" />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-300 mb-6">{body}</p>

            {/* Follow my journey strip */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 mb-6 border-t border-b border-gray-100 dark:border-gray-700/50">
              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm flex-shrink-0">{t('followJourney')}</span>
              <div className="flex items-center gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${s.bg} transition-all duration-200 hover:scale-105 hover:shadow-md`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                      {s.icon}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Credential badges — passport stamp style */}
            <div className="grid grid-cols-2 gap-3">
              {credentials.slice(0, 4).map((c: string, i: number) => {
                const style = CREDENTIAL_STYLES[i % CREDENTIAL_STYLES.length];
                return (
                  <div
                    key={c}
                    className={`relative ${style.bg} border-2 ${style.border} rounded-2xl p-4 text-center`}
                  >
                    <div className="text-2xl mb-2">{style.emoji}</div>
                    <p className={`text-xs font-semibold ${style.text} leading-snug`}>{c}</p>
                  </div>
                );
              })}
            </div>

            {/* Extra credentials if more than 4 */}
            {credentials.length > 4 && (
              <ul className="mt-4 space-y-2">
                {credentials.slice(4).map((c: string) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-teal-500 mt-0.5 flex-shrink-0">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
