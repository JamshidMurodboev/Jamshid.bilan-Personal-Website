'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Props {
  photos: string[];
  name: string;
}

export default function ResultPhotoGallery({ photos, name }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const close = () => setLightboxIdx(null);

  return (
    <>
      <div className="flex flex-col gap-4">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className="relative w-full rounded-2xl border border-line overflow-hidden bg-soft cursor-zoom-in transition-opacity hover:opacity-90 focus:outline-none focus:border-[var(--accent)]"
            style={{ aspectRatio: '4/3' }}
          >
            <Image src={url} alt={`${name} ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border border-white/25 text-white hover:border-white hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {photos.length > 1 && (
            <>
              {lightboxIdx > 0 && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.max(0, (i ?? 1) - 1)); }}
                  aria-label="Previous photo"
                  className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full border border-white/25 text-white hover:border-white hover:bg-white/10 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {lightboxIdx < photos.length - 1 && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.min(photos.length - 1, (i ?? 0) + 1)); }}
                  aria-label="Next photo"
                  className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full border border-white/25 text-white hover:border-white hover:bg-white/10 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
          <div
            className="relative max-w-3xl w-full mx-16 max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIdx]}
              alt={`${name} ${lightboxIdx + 1}`}
              className="w-full h-auto max-h-[90vh] object-contain rounded-2xl"
            />
            {photos.length > 1 && (
              <div className="text-center text-white/60 text-sm mt-3 tabular-nums">{lightboxIdx + 1} / {photos.length}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
