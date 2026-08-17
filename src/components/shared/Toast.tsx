'use client';
import { useEffect, useState } from 'react';

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: message }));
}

export default function Toast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      setMessage(detail);
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    window.addEventListener('app-toast', onToast);
    return () => window.removeEventListener('app-toast', onToast);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4">
      <div className="flex items-center gap-2 bg-ink text-[var(--bg)] px-5 py-2.5 rounded-full text-sm font-semibold animate-[fadeIn_0.2s_ease-out]">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
        </svg>
        {message}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
