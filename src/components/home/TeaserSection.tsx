import Link from 'next/link';
import { useLocale } from 'next-intl';

const TEASERS = [
  {
    href: '/scholarships',
    title: 'Grantlar',
    desc: "To'liq moliyalashtirilgan grant dasturlari katalogi",
    emoji: '🎓',
    color: 'from-teal-500 to-teal-600',
  },
  {
    href: '/universities',
    title: 'Universitetlar',
    desc: "To'lov asosida xorijiy universitetlar ro'yxati",
    emoji: '🏫',
    color: 'from-sky-500 to-sky-600',
  },
  {
    href: '/results',
    title: 'Natijalar',
    desc: "Muvaffaqiyatli qabul bo'lgan talabalar",
    emoji: '🏆',
    color: 'from-amber-500 to-amber-600',
  },
  {
    href: '/blog',
    title: 'Blog',
    desc: "Foydali maslahatlar va qo'llanmalar",
    emoji: '📝',
    color: 'from-violet-500 to-violet-600',
  },
];

export default function TeaserSection() {
  const locale = useLocale();
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Nima topasiz?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Xorijda ta&#39;lim olish uchun zarur bo&#39;lgan barcha ma&#39;lumotlar bir joyda</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEASERS.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}
              >
                {item.emoji}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors text-lg">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              <div className="mt-4 text-teal-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Ko&#39;proq &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
