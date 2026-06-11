import Link from 'next/link';
import { useLocale } from 'next-intl';

const TEASERS = [
  { href: '/scholarships', title: 'Grantlar', desc: "To'liq moliyalashtirilgan grant dasturlari", emoji: '🎓' },
  { href: '/universities', title: 'Universitetlar', desc: "To'lov asosida xorijiy universitetlar", emoji: '🏫' },
  { href: '/results', title: 'Natijalar', desc: 'Muvaffaqiyatli talabalar', emoji: '🏆' },
  { href: '/blog', title: 'Blog', desc: "Foydali maslahatlar va qo'llanmalar", emoji: '📝' },
];

export default function TeaserSection() {
  const locale = useLocale();
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEASERS.map((t) => (
          <Link key={t.href} href={`/${locale}${t.href}`}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
            <div className="text-3xl mb-3">{t.emoji}</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition">{t.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
