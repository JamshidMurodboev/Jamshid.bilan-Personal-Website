'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { Faq } from '@/lib/supabase/types';

const FALLBACK: Faq[] = [
  {
    id: 'f1',
    question_uz: 'Xizmat qancha turadi?',
    question_ru: 'Сколько стоит услуга?',
    question_en: 'How much does the service cost?',
    answer_uz: "Narx tanlangan xizmat turiga qarab belgilanadi. Aniq narx uchun Bog'lanish bo'limi orqali murojaat qiling.",
    answer_ru: 'Цена зависит от выбранного вида услуги. Для точной цены обратитесь через раздел «Контакты».',
    answer_en: 'The price depends on the type of service chosen. For an exact price, please reach out via the Contact section.',
    sort_order: 1, created_at: '', updated_at: '',
  },
  {
    id: 'f2',
    question_uz: 'Qaysi grantlar uchun yordam beradi?',
    question_ru: 'По каким грантам вы помогаете?',
    question_en: 'Which scholarships do you help with?',
    answer_uz: "Türkiye Burslari, Chevening, DAAD, Erasmus+, MEXT va boshqa ko'plab to'liq grantlar bo'yicha yordam beraman.",
    answer_ru: 'Я помогаю по грантам Türkiye Bursları, Chevening, DAAD, Erasmus+, MEXT и многим другим полностью финансируемым программам.',
    answer_en: 'I provide guidance for Türkiye Bursları, Chevening, DAAD, Erasmus+, MEXT and many other fully-funded scholarships.',
    sort_order: 2, created_at: '', updated_at: '',
  },
  {
    id: 'f3',
    question_uz: 'Natija kafolatlanadi mi?',
    question_ru: 'Гарантируется ли результат?',
    question_en: 'Is the result guaranteed?',
    answer_uz: "Yuzlab talabaga yordam bergan tajriba asosida hujjatlaringizni eng yuqori sifatda tayyorlashga ko'maklashaman, biroq yakuniy qarorni kafolatlab bo'lmaydi.",
    answer_ru: 'Опираясь на опыт помощи сотням студентов, я помогу подготовить ваши документы на самом высоком уровне, однако окончательное решение грантовой комиссии гарантировать невозможно.',
    answer_en: 'Based on experience helping hundreds of students, I will help prepare your documents to the highest standard, but the final decision of the scholarship committee cannot be guaranteed.',
    sort_order: 3, created_at: '', updated_at: '',
  },
  {
    id: 'f4',
    question_uz: 'Jarayon qanday ketadi?',
    question_ru: 'Как проходит процесс?',
    question_en: 'How does the process work?',
    answer_uz: "Avval maqsadingiz aniqlanadi, so'ng hujjatlar tayyorlanadi, motivatsiya xati va CV ishlab chiqiladi, ariza topshirish bosqichigacha kuzatib boraman.",
    answer_ru: 'Сначала определяется ваша цель, затем готовятся документы, разрабатываются мотивационное письмо и резюме, и я сопровождаю вас от начала до подачи заявки.',
    answer_en: 'First your goal is defined, then documents are prepared, a motivation letter and CV are developed, and I guide you from start through to submitting the application.',
    sort_order: 4, created_at: '', updated_at: '',
  },
];

export default function FaqSection() {
  const locale = useLocale();
  const t = useTranslations('faq');
  const [items, setItems] = useState<Faq[]>(FALLBACK);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as Faq[]);
      });
  }, []);

  function field(item: Faq, base: 'question' | 'answer') {
    return (item as any)[`${base}_${locale}`] || (item as any)[`${base}_uz`];
  }

  return (
    <section className="section-pad bg-soft border-t border-line">
      <div className="container-page">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="eyebrow mb-4">FAQ</p>
            <h2 className="display text-4xl sm:text-5xl">{t('title')}</h2>
          </div>

          <div className="border-t border-line">
            {items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div key={item.id} className="border-b border-line">
                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-6 text-left py-5 group"
                  >
                    <span className="font-display text-lg sm:text-xl text-heading leading-snug group-hover:text-accent transition-colors">
                      {field(item, 'question')}
                    </span>
                    <svg
                      className={`w-4 h-4 flex-shrink-0 text-muted-e transition-transform duration-300 ${isOpen ? 'rotate-45 text-accent' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out text-sm text-body leading-relaxed"
                    style={{ maxHeight: isOpen ? '20rem' : '0px', paddingBottom: isOpen ? '1.25rem' : '0px' }}
                  >
                    <p className="max-w-xl">{field(item, 'answer')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
