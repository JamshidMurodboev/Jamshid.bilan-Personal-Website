import { setRequestLocale } from 'next-intl/server';
import ContactForm from '@/components/contact/ContactForm';

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Boglanish</h1>
        <p className="text-gray-600 mb-8">Savol va murojaatlaringiz uchun quyidagi kanallar orqali boglanang.</p>
        <div className="flex gap-4 mb-8">
          <a href="https://t.me/jamshidmurodboev" target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-[#0088cc] text-white text-center py-3 rounded-xl font-semibold hover:bg-[#0077b5] transition">
            Telegram
          </a>
          <a href="https://wa.me/998901234567" target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-[#25d366] text-white text-center py-3 rounded-xl font-semibold hover:bg-[#20b956] transition">
            WhatsApp
          </a>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
