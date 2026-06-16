import type { Scholarship, University } from '@/lib/supabase/types';

export const SAMPLE_SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    title: 'Turkiye Burslari',
    country: 'Turkiya',
    coverage: ['tuition', 'housing', 'stipend', 'flights'],
    deadline: '2025-02-20',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Chevening Scholarship',
    country: 'Buyuk Britaniya',
    coverage: ['tuition', 'housing', 'stipend', 'flights'],
    deadline: '2024-11-05',
    status: 'closed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'DAAD Scholarship',
    country: 'Germaniya',
    coverage: ['tuition', 'stipend'],
    deadline: '2025-10-15',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const SAMPLE_UNIVERSITIES: University[] = [
  {
    id: '1',
    name: 'Istanbul University',
    country: 'Turkiya',
    city: 'Istanbul',
    website_url: 'https://istanbul.edu.tr',
    type: 'public',
    programs: ['Tibbiyot', 'Muhandislik', 'Iqtisodiyot', 'Huquq'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];
