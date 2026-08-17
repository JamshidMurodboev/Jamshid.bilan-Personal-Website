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
    <section id="about" className="section-pad">
      <div className="container-page">
        {/* Section header */}
        <div className="mb-14">
          <p className="eyebrow mb-4">02 — About</p>
          <h2 className="display text-4xl sm:text-5xl">{t('title')}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Photo */}
          <div className="flex justify-center md:justify-start">
            <div className="relative">
              {/* Offset frame line */}
              <div className="absolute -top-4 -left-4 w-full h-full rounded-[1.5rem] border border-line" aria-hidden="true" />
              <div className="relative w-72 h-80 md:w-80 md:h-[420px] rounded-[1.5rem] overflow-hidden bg-soft">
                <Image src={photo} alt="Jamshid Murodboev" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-lg leading-[1.8] text-body mb-8">{body}</p>

            {/* Follow my journey strip */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 mb-8 border-y border-line">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-e flex-shrink-0">{t('followJourney')}</span>
              <div className="flex items-center gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-line text-heading hover:border-accent hover:text-accent hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                      {s.icon}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Credentials — numbered editorial list */}
            <ul>
              {credentials.map((c: string, i: number) => (
                <li key={c} className="flex items-baseline gap-5 py-3.5 border-b border-line first:pt-0">
                  <span className="font-display text-lg text-accent w-7 flex-shrink-0 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-body leading-snug">{c}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
