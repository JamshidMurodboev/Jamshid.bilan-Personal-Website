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
            className="w-10 h-10 flex items-center justify-center rounded-full border border-line bg-page/80 backdrop-blur-sm text-heading hover:border-accent hover:text-accent hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              {s.icon}
            </svg>
          </a>
        ))}
        <div className="w-px h-10 bg-[var(--line)] mt-1" aria-hidden="true" />
      </div>

      {/* Mobile: fixed bottom row */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-page/85 backdrop-blur-md border border-line rounded-full px-3 py-2">
        {SOCIALS.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-heading hover:border-accent hover:text-accent transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              {s.icon}
            </svg>
          </a>
        ))}
      </div>
    </>
  );
}
