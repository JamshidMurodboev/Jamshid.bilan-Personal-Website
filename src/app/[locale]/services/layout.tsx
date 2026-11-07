import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    uz: "Xizmatlar — Jamshid Murodboev",
    ru: "Услуги — Jamshid Murodboev",
    en: "Services — Jamshid Murodboev",
  };
  const descriptions: Record<string, string> = {
    uz: "Grant ariza yozish, motivatsion xat, CV tayyorlash va boshqa ta'lim xizmatlari.",
    ru: "Написание заявок на гранты, мотивационные письма, подготовка CV и другие образовательные услуги.",
    en: "Grant application writing, motivation letters, CV preparation and other educational services.",
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
