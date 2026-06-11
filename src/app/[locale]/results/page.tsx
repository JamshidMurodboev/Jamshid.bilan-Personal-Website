import StudentCard from '@/components/results/StudentCard';
import type { StudentResult, Stats } from '@/types';

const STATS: Stats = { id: '1', students_helped: 105, full_ride_winners: 5, countries_count: 10, years_active: 4 };

const RESULTS: StudentResult[] = [
  { id: '1', first_name: 'Aziz', award_type: 'scholarship', award_name: 'Turkiye Bursları', year: 2023, quote: 'Jamshid akaning yordami bilan orzuimga yetdim!', country: 'Turkiya', display_order: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: '2', first_name: 'Malika', award_type: 'scholarship', award_name: 'Turkiye Bursları', year: 2022, quote: "Grant olish haqida hech o'ylamagan edim, lekin mumkin ekan!", country: 'Turkiya', display_order: 2, created_at: '2024-01-01T00:00:00Z' },
];

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Talaba', value: STATS.students_helped },
            { label: "To'liq grant", value: STATS.full_ride_winners },
            { label: 'Mamlakat', value: STATS.countries_count },
            { label: 'Yil', value: STATS.years_active },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="text-4xl font-bold text-teal-700">{s.value}+</div>
              <div className="text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Muvaffaqiyat tarihlari</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RESULTS.map((r) => (
            <StudentCard key={r.id} result={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
