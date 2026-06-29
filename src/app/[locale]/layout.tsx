import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/react';
import '../globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollWidgets from '@/components/layout/ScrollWidgets';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: "Jamshid Murodboev — Xorijda ta'lim maslahatchisi",
  description: "To'liq grant va xorijiy universitetlarga qabul bo'lishda professional ko'mak.",
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Jamshid Murodboev',
  },
};

export function generateStaticParams() {
  return [{ locale: 'uz' }, { locale: 'ru' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#f0f9f8] dark:bg-[#0d1117] text-[#0f172a] dark:text-[#e6edf3] transition-colors duration-200`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <ScrollWidgets />
          </AuthProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
