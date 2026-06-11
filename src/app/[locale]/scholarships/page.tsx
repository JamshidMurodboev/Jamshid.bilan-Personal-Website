import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import ScholarshipFilters from '@/components/scholarships/ScholarshipFilters';
import type { Scholarship } from '@/types';

const SAMPLE_SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    title: 'Turkiye Bursları',
    country: 'Turkiya',
    university: 'Barcha davlat universitetlari',
    coverage: ['tuition', 'housing', 'stipend', 'flights'],
    eligibility: '18-30 yosh, bakalavriat yoki magistratura',
    deadline: '2025-02-20',
    difficulty: 4,
    tip: "Motivatsiya xatiga alohida e'tibor bering. Turkiyaga muhabbatingizni ko'rsating.",
    application_url: 'https://turkiyeburslari.gov.tr',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Chevening Scholarship',
    country: 'Buyuk Britaniya',
    coverage: ['tuition', 'housing', 'stipend', 'flights'],
    eligibility: '2+ yil ish tajribasi, magistratura',
    deadline: '2024-11-05',
    difficulty: 5,
    tip: 'Liderlik tajribangizni aniq misollar bilan ifodalang.',
    application_url: 'https://chevening.org',
    status: 'closed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export default function ScholarshipsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grantlar</h1>
        <p className="text-gray-600 mb-8">To'liq moliyalashtirilgan grant dasturlari katalogi</p>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <ScholarshipFilters />
          </aside>
          <div className="flex-1 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {SAMPLE_SCHOLARSHIPS.map((s) => (
              <ScholarshipCard key={s.id} scholarship={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
