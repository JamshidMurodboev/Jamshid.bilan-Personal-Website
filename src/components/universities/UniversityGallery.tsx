'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function UniversityGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0);
  if (photos.length === 0) return null;

  return (
    <div className="mt-4 mb-6">
      <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image src={photos[active]} alt={name} fill className="object-cover transition-opacity duration-200" />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                active === i
                  ? 'border-teal-500 ring-2 ring-teal-500/30'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-teal-300'
              }`}
            >
              <Image src={url} alt={`${name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
