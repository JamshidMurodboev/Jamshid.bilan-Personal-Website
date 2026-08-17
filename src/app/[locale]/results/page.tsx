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
  const hs = useTranslations('homeSections.results')

  const [results, setResults] = useState<StudentResult[]>(SAMPLE_RESULTS)
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('student_results').select('*, scholarships(title)').order('home_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }).then(({ data, error }) => {
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

  const stats = [
    { label: t('stats.student'), value: studentsHelped, suffix: '+' },
    { label: t('stats.country'), value: countriesCount, suffix: '+' },
    { label: t('stats.year'), value: yearsActive, suffix: '+' },
  ]

  return (
    <div className="min-h-screen bg-page">
      {/* Page hero */}
      <section className="pt-10 sm:pt-14 pb-10 sm:pb-14 border-b border-line">
        <div className="container-page">
          <PageNav backHref={`/${locale}#results`} />
          <p className="eyebrow mb-4 mt-4">{hs('title')}</p>
          <h1 className="display text-5xl sm:text-6xl mb-4">{t('successStories')}</h1>
          <p className="text-lg text-body max-w-2xl">{hs('subtitle')}</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container-page">
          {/* Stats */}
          <div className="grid grid-cols-3 border border-line rounded-3xl overflow-hidden bg-card mb-14">
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-col gap-2 py-8 px-4 sm:px-8 border-line [&:not(:first-child)]:border-l">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-e">0{i + 1}</span>
                <div className="font-display text-4xl sm:text-5xl text-heading tabular-nums leading-none">
                  {s.value}<span className="text-accent">{s.suffix}</span>
                </div>
                <div className="text-sm text-body leading-snug">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={
                  activeFilter === f.key
                    ? 'bg-ink text-[var(--bg)] rounded-full px-4 py-2 text-sm font-semibold'
                    : 'border border-line text-body rounded-full px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors'
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Honor roll */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => <StudentCard key={r.id} result={r} locale={locale} />)}
          </div>

          {(activeFilter === 'all' || activeFilter === 'scholarship_winner') && (
            <p className="mt-10 rounded-2xl border border-line bg-soft px-5 py-4 text-sm text-body">
              {t('moreScholarshipResults')}
            </p>
          )}

          {(activeFilter === 'all' || activeFilter === 'tuition_based') && (
            <p className="mt-4 rounded-2xl border border-line bg-soft px-5 py-4 text-sm text-body">
              {t('tuitionNote')}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
