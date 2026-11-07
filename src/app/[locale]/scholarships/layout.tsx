import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    uz: "Grantlar — Jamshid Murodboev",
    ru: "Гранты — Jamshid Murodboev",
    en: "Scholarships — Jamshid Murodboev",
  };
  const descriptions: Record<string, string> = {
    uz: "To'liq moliyalashtirilgan grantlar ro'yxati: Türkiye Burslari, Chevening, DAAD, Erasmus+ va boshqalar.",
    ru: "Список полностью финансируемых грантов: Türkiye Bursları, Chevening, DAAD, Erasmus+ и другие.",
    en: "Fully-funded scholarships list: Türkiye Bursları, Chevening, DAAD, Erasmus+ and more.",
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
