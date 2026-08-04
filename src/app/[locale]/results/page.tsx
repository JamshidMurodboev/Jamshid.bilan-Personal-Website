'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import StudentCard from '@/components/results/StudentCard'
import PageNav from '@/components/shared/PageNav'
import type { StudentResult } from '@/lib/supabase/types'
import { useParams } from 'next/navigation'

const SAMPLE_RESULTS: StudentResult[] = [
  { id: '1', student_name: 'Aziz Karimov', degree_level: 'bachelor', year: 2023, country: 'Turkiya', testimonial: 'Jamshid akaning yordami bilan orzuimga yetdim!', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', student_name: 'Malika Yusupova', degree_level: 'master', year: 2022, country: 'Turkiya', testimonial: 'Grant olish mumkin ekan!', created_at: '2024-01-01T00:00:00Z' },
]

type CategoryFilter = 'all' | 'scholarship_winner' | 'tuition_based'

export default function ResultsPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'uz'
  const t = useTranslations('results')

  const [results, setResults] = useState<StudentResult[]>(SAMPLE_RESULTS)
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('student_results').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data && data.length > 0) setResults(data as StudentResult[])
    })
  }, [])

  const studentsHelped = results.length
  const countriesCount = new Set(results.map((r) => r.country)).size
  const years = results.map((r) => r.year)
  const yearsActive = years.length > 0 ? Math.max(1, new Date().getFullYear() - Math.min(...years) + 1) : 1

  const filtered = activeFilter === 'all'
    ? results
    : results.filter(r => (r as any).category === activeFilter)

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: t('categories.all') },
    { key: 'scholarship_winner', label: t('categories.scholarship_winner') },
    { key: 'tuition_based', label: t('categories.tuition_based') },
  ]

  return (
    <div className="min-h-screen bg-[#f0f9f8] dark:bg-[#0d1117] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <PageNav backHref={`/${locale}`} />
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Talaba', value: studentsHelped, suffix: '+' },
            { label: 'Mamlakat', value: countriesCount, suffix: '+' },
            { label: 'Yil', value: yearsActive, suffix: '+' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-5xl font-extrabold text-teal-700 dark:text-teal-400 leading-none">{s.value}{s.suffix}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Muvaffaqiyat Hikoyalari</h2>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f.key
                  ? 'bg-teal-700 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => <StudentCard key={r.id} result={r} locale={locale} />)}
        </div>
      </div>
    </div>
  )
}
