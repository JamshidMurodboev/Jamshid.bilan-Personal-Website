import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    uz: "Yangiliklar — Jamshid Murodboev",
    ru: "Новости — Jamshid Murodboev",
    en: "News — Jamshid Murodboev",
  };
  const descriptions: Record<string, string> = {
    uz: "Grant va ta'lim sohasidagi so'nggi yangiliklar va maqolalar.",
    ru: "Последние новости и статьи в сфере грантов и образования.",
    en: "Latest news and articles about scholarships and education abroad.",
  };
  return {
    title: titles[locale] ?? titles.uz,
    description: descriptions[locale] ?? descriptions.uz,
    openGraph: {
      title: titles[locale] ?? titles.uz,
      description: descriptions[locale] ?? descriptions.uz,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
