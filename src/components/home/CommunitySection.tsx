import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';

interface Props {
  locale: string;
}

export default async function CommunitySection({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'community' });

  let link = '';
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'community_telegram_link').single();
    link = (data as any)?.value ?? '';
  } catch {
    // table may not exist yet
  }

  if (!link) return null;

  return (
    <section className="bg-ink">
      <div className="container-page py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow justify-center mb-5">05 — Telegram</p>
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--bg)] leading-tight mb-4">{t('title')}</h2>
          <p className="text-[var(--bg)] opacity-70 text-base leading-relaxed mb-8">{t('description')}</p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--accent)] hover:text-[#fffdf8] transition-all duration-300"
          >
            {t('join')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
