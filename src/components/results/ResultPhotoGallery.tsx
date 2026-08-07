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
      <div className="flex flex-col gap-3">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className="relative w-full rounded-2xl overflow-hidden cursor-zoom-in hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
            style={{ aspectRatio: '4/3' }}
          >
            <Image src={url} alt={`${name} ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-2xl"
          >
            ✕
          </button>
          {photos.length > 1 && (
            <>
              {lightboxIdx > 0 && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.max(0, (i ?? 1) - 1)); }}
                  className="absolute left-4 text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-xl"
                >
                  ←
                </button>
              )}
              {lightboxIdx < photos.length - 1 && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.min(photos.length - 1, (i ?? 0) + 1)); }}
                  className="absolute right-4 text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-xl"
                >
                  →
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
              className="w-full h-auto max-h-[90vh] object-contain rounded-xl"
            />
            {photos.length > 1 && (
              <div className="text-center text-white/60 text-sm mt-2">{lightboxIdx + 1} / {photos.length}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
