'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#f0f9f8] dark:bg-[#0d1117] px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xatolik yuz berdi</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Nimadir noto&apos;g&apos;ri ketdi. Iltimos, qayta urinib ko&apos;ring.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                Qayta urinish
              </button>
              <Link href="/uz" className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl font-semibold transition">
                Bosh sahifa
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
