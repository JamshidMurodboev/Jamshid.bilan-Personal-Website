import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f8] dark:bg-[#0d1117] px-4">
      <div className="text-center">
        <div className="text-7xl font-extrabold text-teal-600 dark:text-teal-400 mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sahifa topilmadi</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan.</p>
        <Link href="/uz" className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold transition">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
