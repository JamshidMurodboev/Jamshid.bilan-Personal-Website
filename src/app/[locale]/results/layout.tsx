import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    uz: "Talabalar natijalari — Jamshid Murodboev",
    ru: "Результаты студентов — Jamshid Murodboev",
    en: "Student Results — Jamshid Murodboev",
  };
  const descriptions: Record<string, string> = {
    uz: "Jamshid Murodboev yordamida grant olgan talabalar natijalari va guvohnomalar.",
    ru: "Результаты студентов, получивших гранты с помощью Jamshid Murodboev.",
    en: "Results and testimonials from students who received scholarships with Jamshid Murodboev's guidance.",
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
