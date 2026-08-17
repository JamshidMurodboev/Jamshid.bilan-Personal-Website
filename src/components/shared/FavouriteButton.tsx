'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFavourites } from '@/hooks/useFavourites';
import { useAuth } from '@/lib/auth';

export default function FavouriteButton({ entityType, entityId, className }: { entityType: string; entityId: string; className?: string }) {
  const { user } = useAuth();
  const { isFavourite, toggle } = useFavourites();
  const t = useTranslations('common');
  const [toast, setToast] = useState<string | null>(null);

  if (!user) return null;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(entityType, entityId);
    const msg = result === 'added' ? t('savedToFavourites') : t('removedFromFavourites');
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const fav = isFavourite(entityType, entityId);

  return (
    <div className={className ?? 'relative'}>
      <button onClick={handleClick} className="p-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-line hover:border-accent transition-colors" aria-label="Favourite">
        {fav ? (
          <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        ) : (
          <svg className="w-4 h-4 text-muted-e" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        )}
      </button>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-[var(--bg)] text-sm font-semibold px-5 py-2.5 rounded-full pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}
