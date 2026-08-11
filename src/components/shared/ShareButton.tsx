'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  url: string;
  title: string;
  entityType: string;
  entityId: string;
  entityName?: string;
}

async function logShare(platform: string, entityType: string, entityId: string, entityName?: string) {
  try {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    await sb.from('share_events').insert({
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName || null,
      platform,
      user_id: user?.id || null,
      user_name: user?.email || null,
    });
  } catch (_) {}
}

export default function ShareButton({ url, title, entityType, entityId, entityName }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const platforms = [
    {
      key: 'telegram',
      label: 'Telegram',
      bg: 'bg-[#2AABEE]',
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
      icon: (
        <path d="M21.05 3.27 2.7 10.62c-1.25.5-1.24 1.2-.23 1.51l4.7 1.47 1.83 5.6c.22.6.37.84.76.84.3 0 .43-.14.6-.3l2.5-2.4 4.78 3.53c.88.49 1.5.24 1.72-.81L21.94 4.4c.3-1.28-.49-1.85-1.4-1.13Z" fill="white" />
      ),
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      bg: 'bg-[#25D366]',
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      icon: (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white" />
      ),
    },
    {
      key: 'instagram',
      label: 'Copy for Instagram',
      bg: 'bg-gradient-to-br from-[#E1306C] via-[#F77737] to-[#FCAF45]',
      href: null,
      icon: (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="17.5" cy="6.5" r="1" fill="white" />
        </>
      ),
    },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await logShare('instagram', entityType, entityId, entityName);
    } catch (_) {}
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5"
        aria-label="Share"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Ulashish
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 flex gap-2 min-w-[160px]">
          {platforms.map(p =>
            p.href ? (
              <a
                key={p.key}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { logShare(p.key, entityType, entityId, entityName); setOpen(false); }}
                className={`w-10 h-10 flex items-center justify-center rounded-full ${p.bg} transition-transform hover:scale-110 flex-shrink-0`}
                aria-label={p.label}
                title={p.label}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">{p.icon}</svg>
              </a>
            ) : (
              <button
                key={p.key}
                onClick={handleCopy}
                className={`w-10 h-10 flex items-center justify-center rounded-full ${p.bg} transition-transform hover:scale-110 flex-shrink-0`}
                aria-label={copied ? 'Copied!' : p.label}
                title={copied ? 'Copied!' : p.label}
              >
                {copied
                  ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" stroke="white" fill="none" /></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">{p.icon}</svg>
                }
              </button>
            )
          )}
          {/* Copy link button */}
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              await logShare('copy_link', entityType, entityId, entityName);
              setOpen(false);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 transition-transform hover:scale-110 flex-shrink-0"
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied
              ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" stroke="currentColor" fill="none" className="text-teal-600" /></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            }
          </button>
        </div>
      )}

      {/* Backdrop to close */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}
