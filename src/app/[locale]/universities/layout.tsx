import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    uz: "Universitetlar — Jamshid Murodboev",
    ru: "Университеты — Jamshid Murodboev",
    en: "Universities — Jamshid Murodboev",
  };
  const descriptions: Record<string, string> = {
    uz: "Xorijiy universitetlar va qabul talablari haqida batafsil ma'lumot.",
    ru: "Подробная информация об иностранных университетах и требованиях к поступлению.",
    en: "Detailed information about foreign universities and admission requirements.",
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
