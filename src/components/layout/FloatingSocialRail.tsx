'use client';
import { SOCIALS } from '@/lib/socials';

export default function FloatingSocialRail() {
  return (
    <>
      {/* Desktop: fixed left vertical rail */}
      <div className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3">
        {SOCIALS.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={`w-10 h-10 flex items-center justify-center rounded-full ${s.bg} shadow-md transition-transform duration-200 hover:scale-110 hover:shadow-lg opacity-90 hover:opacity-100`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
              {s.icon}
            </svg>
          </a>
        ))}
        <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 mt-1 opacity-50" />
      </div>

      {/* Mobile: fixed bottom row */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-lg">
        {SOCIALS.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${s.bg} transition-transform duration-200 hover:scale-110`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
              {s.icon}
            </svg>
          </a>
        ))}
      </div>
    </>
  );
}
