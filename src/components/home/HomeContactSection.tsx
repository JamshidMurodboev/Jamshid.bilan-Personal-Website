'use client';
import ContactForm from '@/components/shared/ContactForm';

export default function HomeContactSection() {
  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-900" id="contact">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Bog'lanish</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Ma'lumotlaringizni kiriting — xabar avtomatik tuziladi</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
