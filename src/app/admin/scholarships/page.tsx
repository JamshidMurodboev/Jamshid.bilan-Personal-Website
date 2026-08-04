'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Scholarship, StudentResult } from '@/lib/supabase/types'
import CountrySelect from '@/components/admin/CountrySelect'
import ImageUpload from '@/components/admin/ImageUpload'
import { autoTranslate } from '@/lib/translate'
import { slugify } from '@/lib/slugify'
import MediaLinksAdmin from '@/components/admin/MediaLinksAdmin'
import type { MediaLink } from '@/lib/supabase/types'

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

type Category = 'fully_funded' | 'partially_funded' | 'self_funded'
type ResultsDateType = 'exact' | 'month' | 'period'

const categoryLabels: Record<Category, string> = {
  fully_funded: "To'liq moliyalashtirilgan",
  partially_funded: 'Qisman moliyalashtirilgan',
  self_funded: "O'z hisobiga",
}

const DEGREE_OPTIONS = [
  { value: 'bachelor', label: 'Bakalavr' },
  { value: 'master', label: 'Magistratura' },
  { value: 'phd', label: 'PhD' },
  { value: 'exchange', label: 'Almashinuv (Exchange)' },
]

const emptyForm = {
  title: '',
  country: '',
  university: '',
  coverage: '',
  coverage_ru: '',
  coverage_en: '',
  application_url: '',
  status: 'open' as Scholarship['status'],
  category: '' as Category | '',
  degrees_available: [] as string[],
  description_uz: '',
  description_ru: '',
  description_en: '',
  open_date: '',
  close_date: '',
  results_date_type: 'exact' as ResultsDateType,
  results_date: '',
  photo_urls: [] as string[],
  // new process period fields
  application_period_type: 'exact' as ResultsDateType,
  application_period: '',
  interview_exam_period_type: 'exact' as ResultsDateType,
  interview_exam_period: '',
  results_period_type: 'exact' as ResultsDateType,
  results_period: '',
  home_order: '' as string,
  slug: '',
}

type FormState = typeof emptyForm

// Required document row
type DocRow = { uz: string; ru: string; en: string; mandatory?: boolean }
const emptyDoc = (): DocRow => ({ uz: '', ru: '', en: '', mandatory: true })

// Scholarship process step
type ProcessStep = { key: string; label: string; type: ResultsDateType; value: string; description_uz: string; description_ru: string; description_en: string; custom?: boolean }
const DEFAULT_STEPS: ProcessStep[] = [
  { key: 'admission', label: "Qabul muddati / Ariza davri", type: 'period', value: '', description_uz: '', description_ru: '', description_en: '' },
  { key: 'interview_exam', label: "Suhbat / Imtihon davri", type: 'period', value: '', description_uz: '', description_ru: '', description_en: '' },
  { key: 'results', label: "Natijalar davri", type: 'period', value: '', description_uz: '', description_ru: '', description_en: '' },
]

function StatusBadge({ status }: { status: Scholarship['status'] }) {
  const cfg = {
    open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    upcoming: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  const lbl = { open: 'Ochiq', closed: 'Yopiq', upcoming: 'Kelayotgan' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg[status]}`}>{lbl[status]}</span>
}

export default function ScholarshipsPage() {
  const [items, setItems] = useState<Scholarship[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [translatingSections, setTranslatingSections] = useState<Record<string, boolean>>({})
  const [studentResults, setStudentResults] = useState<StudentResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [requiredDocs, setRequiredDocs] = useState<DocRow[]>([])
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(DEFAULT_STEPS)
  const [mediaLinks, setMediaLinks] = useState<MediaLink[]>([])
  const [showDocsPreview, setShowDocsPreview] = useState(false)
  const dragIdx = useRef<number | null>(null)

  function handleDragStart(index: number) { setDragIndex(index) }
  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const newItems = [...items]
    const [moved] = newItems.splice(dragIndex, 1)
    newItems.splice(index, 0, moved)
    setItems(newItems)
    setDragIndex(index)
  }
  function handleDrop() {
    setDragIndex(null)
    saveOrder()
  }
  async function saveOrder() {
    const sb = createClient()
    for (let i = 0; i < items.length; i++) {
      await sb.from('scholarships').update({ home_order: i + 1 }).eq('id', items[i].id)
    }
  }

  async function load() {
    setLoading(true)
    const { data, error } = await createClient()
      .from('scholarships')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function loadStudentResults(scholarshipId: string) {
    setResultsLoading(true)
    const { data } = await createClient()
      .from('student_results')
      .select('id, student_name, year, degree_level')
      .eq('scholarship_id', scholarshipId)
      .order('year', { ascending: false })
    setStudentResults((data as StudentResult[]) ?? [])
    setResultsLoading(false)
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setStudentResults([])
    setRequiredDocs([])
    setProcessSteps(DEFAULT_STEPS.map(s => ({ ...s })))
    setMediaLinks([])
    setError(null)
    setShowModal(true)
  }

  function openEdit(item: Scholarship) {
    setEditId(item.id)
    setForm({
      title: item.title,
      country: item.country,
      university: item.university ?? '',
      coverage: item.coverage?.join(', ') ?? '',
      coverage_ru: (item as any).coverage_ru?.join(', ') ?? '',
      coverage_en: (item as any).coverage_en?.join(', ') ?? '',
      application_url: item.application_url ?? '',
      status: item.status,
      category: (item.category as Category) ?? '',
      degrees_available: (item as any).degrees_available ?? [],
      description_uz: item.description_uz ?? '',
      description_ru: item.description_ru ?? '',
      description_en: item.description_en ?? '',
      open_date: item.open_date ?? '',
      close_date: item.close_date ?? '',
      results_date_type: (item.results_date_type as ResultsDateType) ?? 'exact',
      results_date: item.results_date ?? '',
      photo_urls: item.photo_urls ?? [],
      application_period_type: (item as any).application_period_type ?? 'exact',
      application_period: (item as any).application_period ?? '',
      interview_exam_period_type: (item as any).interview_exam_period_type ?? 'exact',
      interview_exam_period: (item as any).interview_exam_period ?? '',
      results_period_type: (item as any).results_period_type ?? 'exact',
      results_period: (item as any).results_period ?? '',
      home_order: item.home_order?.toString() ?? '',
      slug: item.slug ?? slugify(item.title),
    })
    setRequiredDocs((item as any).required_documents ?? [])
    setMediaLinks((item as any).media_links ?? [])
    // Load process steps — merge legacy admission+application into one
    const sp: any[] = (item as any).scholarship_process ?? []
    if (sp.length > 0) {
      const hasAdmission = sp.some(s => s.key === 'admission')
      const hasApplication = sp.some(s => s.key === 'application')
      let normalized = sp
      if (hasAdmission && hasApplication) {
        const admission = sp.find(s => s.key === 'admission')
        const application = sp.find(s => s.key === 'application')
        const merged = {
          key: 'admission', label: DEFAULT_STEPS[0].label,
          type: admission.type || 'period',
          value: admission.value || application.value || '',
          description_uz: admission.description_uz || application.description_uz || '',
          description_ru: admission.description_ru || application.description_ru || '',
          description_en: admission.description_en || application.description_en || '',
        }
        normalized = [merged, ...sp.filter(s => s.key !== 'admission' && s.key !== 'application')]
      }
      setProcessSteps(normalized.map(s => ({
        key: s.key, label: DEFAULT_STEPS.find(d => d.key === s.key)?.label || s.label || s.key,
        type: s.type || 'period', value: s.value || '',
        description_uz: s.description_uz || '', description_ru: s.description_ru || '', description_en: s.description_en || '',
        custom: !DEFAULT_STEPS.some(d => d.key === s.key),
      })))
    } else {
      // migrate from old flat fields
      const admissionValue = [item.open_date, item.close_date].filter(Boolean).join(' – ')
        || (item as any).application_period || ''
      setProcessSteps([
        { ...DEFAULT_STEPS[0], type: 'period', value: admissionValue },
        { ...DEFAULT_STEPS[1], type: (item as any).interview_exam_period_type || 'period', value: (item as any).interview_exam_period || '' },
        { ...DEFAULT_STEPS[2], type: (item as any).results_period_type || 'period', value: (item as any).results_period || '' },
      ])
    }
    setError(null)
    setShowModal(true)
    loadStudentResults(item.id)
  }

  async function handleTranslate() {
    if (!form.description_uz.trim()) return
    setTranslating(true)
    try {
      const result = await autoTranslate(form.description_uz)
      setForm(f => ({
        ...f,
        description_ru: result.ru || f.description_ru,
        description_en: result.en || f.description_en,
      }))
    } finally {
      setTranslating(false)
    }
  }

  async function handleTranslateCoverage() {
    if (!form.coverage.trim()) return
    setTranslatingSections(s => ({ ...s, coverage: true }))
    try {
      const result = await autoTranslate(form.coverage)
      setForm(f => ({ ...f, coverage_ru: result.ru || f.coverage_ru, coverage_en: result.en || f.coverage_en }))
    } finally {
      setTranslatingSections(s => ({ ...s, coverage: false }))
    }
  }

  async function handleTranslateDoc(i: number) {
    const doc = requiredDocs[i]
    if (!doc.uz.trim()) return
    setTranslatingSections(s => ({ ...s, [`doc_${i}`]: true }))
    try {
      const result = await autoTranslate(doc.uz)
      setRequiredDocs(d => d.map((r, j) => j === i ? { ...r, ru: result.ru || r.ru, en: result.en || r.en } : r))
    } finally {
      setTranslatingSections(s => ({ ...s, [`doc_${i}`]: false }))
    }
  }

  async function handleTranslateStep(i: number) {
    const step = processSteps[i]
    if (!step.description_uz.trim()) return
    setTranslatingSections(s => ({ ...s, [`step_${i}`]: true }))
    try {
      const result = await autoTranslate(step.description_uz)
      setProcessSteps(ps => ps.map((p, j) => j === i ? { ...p, description_ru: result.ru || p.description_ru, description_en: result.en || p.description_en } : p))
    } finally {
      setTranslatingSections(s => ({ ...s, [`step_${i}`]: false }))
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    let description_ru = form.description_ru
    let description_en = form.description_en

    if (form.description_uz.trim() && (!description_ru || !description_en)) {
      try {
        const result = await autoTranslate(form.description_uz)
        if (!description_ru) description_ru = result.ru
        if (!description_en) description_en = result.en
      } catch {
        // ignore translate errors
      }
    }

    const filteredDocs = requiredDocs.filter(d => d.uz.trim())
    const filteredSteps = processSteps.filter(s => s.value.trim() || s.label.trim()).map(s => ({
      key: s.key, label: s.label, type: s.type, value: s.value,
      description_uz: s.description_uz || null,
      description_ru: s.description_ru || null,
      description_en: s.description_en || null,
    }))

    const payload = {
      title: form.title,
      country: form.country,
      university: form.university || null,
      coverage: form.coverage ? form.coverage.split(',').map(s => s.trim()).filter(Boolean) : [],
      coverage_ru: form.coverage_ru ? form.coverage_ru.split(',').map(s => s.trim()).filter(Boolean) : null,
      coverage_en: form.coverage_en ? form.coverage_en.split(',').map(s => s.trim()).filter(Boolean) : null,
      application_url: form.application_url || null,
      status: form.status,
      category: form.category || null,
      degrees_available: form.degrees_available.length > 0 ? form.degrees_available : null,
      description_uz: form.description_uz || null,
      description_ru: description_ru || null,
      description_en: description_en || null,
      open_date: form.open_date || null,
      close_date: form.close_date || null,
      results_date_type: form.results_date_type,
      results_date: form.results_date || null,
      photo_urls: form.photo_urls.length > 0 ? form.photo_urls : null,
      application_period_type: form.application_period_type,
      application_period: form.application_period || null,
      interview_exam_period_type: form.interview_exam_period_type,
      interview_exam_period: form.interview_exam_period || null,
      results_period_type: form.results_period_type,
      results_period: form.results_period || null,
      required_documents: filteredDocs.length > 0 ? filteredDocs : null,
      scholarship_process: filteredSteps.length > 0 ? filteredSteps : null,
      home_order: form.home_order ? parseInt(form.home_order) : null,
      slug: form.slug || slugify(form.title) || null,
      media_links: mediaLinks.filter(l => l.url.trim()).length > 0 ? mediaLinks.filter(l => l.url.trim()) : null,
    }

    const supabase = createClient()
    const res = editId
      ? await supabase.from('scholarships').update(payload).eq('id', editId)
      : await supabase.from('scholarships').insert(payload)

    if (res.error) {
      setError(res.error.message)
    } else {
      setShowModal(false)
      load()
    }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('scholarships').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  const degreeLevelLabel: Record<string, string> = {
    bachelor: "Bakalavr",
    master: "Magistr",
    phd: "PhD",
  }

  function resultsDateLabel(type: ResultsDateType) {
    if (type === 'exact') return "Aniq sana (YYYY-MM-DD)"
    if (type === 'month') return "Oy (YYYY-MM)"
    return "Davr (masalan: Mart-Aprel)"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Grantlar</h1>
        <button
          onClick={openCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Qo&apos;shish
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
      )}

      {loading ? (
        <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Davlat</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Kategoriya</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  className={`border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${dragIndex === index ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-400 cursor-grab select-none">⠿</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.country}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    {item.category ? categoryLabels[item.category as Category] : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.close_date ?? '—'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-teal-700 dark:text-teal-400 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    >
                      Tahrir
                    </button>
                    <button
                      onClick={() => del(item.id)}
                      className="text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      O&apos;chir
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Ma&apos;lumot yo&apos;q</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editId ? 'Grantni tahrirlash' : 'Yangi grant'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nomi *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL Slug (avtomatik)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inp} placeholder="turkiye-burslari" />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Davlat *</label>
                <CountrySelect
                  value={form.country}
                  onChange={v => setForm({ ...form, country: v })}
                  required
                  className={inp}
                />
              </div>

              {/* University */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Universitet</label>
                <input
                  value={form.university}
                  onChange={e => setForm({ ...form, university: e.target.value })}
                  className={inp}
                />
              </div>

              {/* Coverage */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Qamrov (vergul bilan) (UZ)</label>
                  <button
                    type="button"
                    onClick={handleTranslateCoverage}
                    disabled={!!translatingSections['coverage'] || !form.coverage.trim()}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {translatingSections['coverage'] ? 'Tarjimon...' : 'RU/EN ga tarjima qilish'}
                  </button>
                </div>
                <input
                  value={form.coverage}
                  onChange={e => setForm({ ...form, coverage: e.target.value })}
                  placeholder="Turar joy, Ovqat, Stipendiya"
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Qamrov (RU)</label>
                <input
                  value={form.coverage_ru}
                  onChange={e => setForm({ ...form, coverage_ru: e.target.value })}
                  placeholder="Жильё, Питание, Стипендия"
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Qamrov (EN)</label>
                <input
                  value={form.coverage_en}
                  onChange={e => setForm({ ...form, coverage_en: e.target.value })}
                  placeholder="Housing, Meals, Stipend"
                  className={inp}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kategoriya</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as Category | '' })}
                  className={inp}
                >
                  <option value="">— Tanlang —</option>
                  <option value="fully_funded">To&apos;liq moliyalashtirilgan</option>
                  <option value="partially_funded">Qisman moliyalashtirilgan</option>
                  <option value="self_funded">O&apos;z hisobiga</option>
                </select>
              </div>

              {/* Degrees available */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Ta&apos;lim darajalari</label>
                <div className="flex flex-wrap gap-3">
                  {DEGREE_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.degrees_available.includes(opt.value)}
                        onChange={e => {
                          const updated = e.target.checked
                            ? [...form.degrees_available, opt.value]
                            : form.degrees_available.filter(d => d !== opt.value)
                          setForm({ ...form, degrees_available: updated })
                        }}
                        className="w-4 h-4 rounded accent-teal-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description UZ */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tavsif (UZ)</label>
                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={translating || !form.description_uz.trim()}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {translating ? 'Tarjimon...' : 'RU/EN ga tarjima qilish'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={form.description_uz}
                  onChange={e => setForm({ ...form, description_uz: e.target.value })}
                  className={inp}
                />
              </div>

              {/* Description RU */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tavsif (RU)</label>
                <textarea
                  rows={3}
                  value={form.description_ru}
                  onChange={e => setForm({ ...form, description_ru: e.target.value })}
                  className={inp}
                />
              </div>

              {/* Description EN */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tavsif (EN)</label>
                <textarea
                  rows={3}
                  value={form.description_en}
                  onChange={e => setForm({ ...form, description_en: e.target.value })}
                  className={inp}
                />
              </div>

              {/* Grant Jarayoni — Scholarship Process */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Grant Jarayoni</h3>
                  <button
                    type="button"
                    onClick={() => setProcessSteps(ps => [...ps, { key: `custom_${Date.now()}`, label: '', type: 'period', value: '', description_uz: '', description_ru: '', description_en: '', custom: true }])}
                    className="text-xs text-teal-700 dark:text-teal-400 font-medium hover:underline"
                  >
                    + Bosqich qo&apos;shish
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Bosqichlarni tortib qayta tartiblash mumkin</p>
                <div className="space-y-2">
                  {processSteps.map((step, idx) => (
                    <div
                      key={step.key}
                      draggable
                      onDragStart={() => { dragIdx.current = idx }}
                      onDragOver={e => { e.preventDefault() }}
                      onDrop={() => {
                        if (dragIdx.current === null || dragIdx.current === idx) return
                        setProcessSteps(ps => {
                          const next = [...ps]
                          const [moved] = next.splice(dragIdx.current!, 1)
                          next.splice(idx, 0, moved)
                          return next
                        })
                        dragIdx.current = null
                      }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-400 dark:text-gray-500 cursor-grab select-none">⠿</span>
                        {step.custom ? (
                          <input
                            value={step.label}
                            onChange={e => setProcessSteps(ps => ps.map((p, j) => j === idx ? { ...p, label: e.target.value } : p))}
                            placeholder="Bosqich nomi..."
                            className="flex-1 text-xs font-semibold border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{step.label}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setProcessSteps(ps => ps.filter((_, j) => j !== idx))}
                          className="ml-auto text-red-500 text-xs hover:underline flex-shrink-0"
                        >
                          O&apos;chirish
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <select
                          value={step.type}
                          onChange={e => setProcessSteps(ps => ps.map((p, j) => j === idx ? { ...p, type: e.target.value as ResultsDateType, value: '' } : p))}
                          className={inp}
                        >
                          <option value="exact">Aniq sana</option>
                          <option value="month">Oy</option>
                          <option value="period">Davr</option>
                        </select>
                        {step.type === 'exact' ? (
                          <input type="date" value={step.value} onChange={e => setProcessSteps(ps => ps.map((p, j) => j === idx ? { ...p, value: e.target.value } : p))} className={inp} />
                        ) : (
                          <input type="text" value={step.value} onChange={e => setProcessSteps(ps => ps.map((p, j) => j === idx ? { ...p, value: e.target.value } : p))} placeholder={step.type === 'month' ? '2025-04' : 'Mart – Aprel'} className={inp} />
                        )}
                      </div>
                      {/* Descriptions */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Tavsif (UZ)</label>
                          <button
                            type="button"
                            disabled={!step.description_uz.trim() || !!translatingSections[`step_${idx}`]}
                            onClick={() => handleTranslateStep(idx)}
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-40"
                          >
                            {translatingSections[`step_${idx}`] ? 'Tarjimon...' : 'RU/EN tarjima'}
                          </button>
                        </div>
                        <input value={step.description_uz} onChange={e => setProcessSteps(ps => ps.map((p, j) => j === idx ? { ...p, description_uz: e.target.value } : p))} className={inp} placeholder="Bu bosqich haqida qo'shimcha ma'lumot..." />
                        <input value={step.description_ru} onChange={e => setProcessSteps(ps => ps.map((p, j) => j === idx ? { ...p, description_ru: e.target.value } : p))} className={inp} placeholder="Описание (RU)" />
                        <input value={step.description_en} onChange={e => setProcessSteps(ps => ps.map((p, j) => j === idx ? { ...p, description_en: e.target.value } : p))} className={inp} placeholder="Description (EN)" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Talab qilinadigan hujjatlar</h3>
                  <button type="button" onClick={() => setRequiredDocs(d => [...d, emptyDoc()])} className="text-xs text-teal-700 dark:text-teal-400 font-medium hover:underline">+ Qo&apos;shish</button>
                </div>
                {requiredDocs.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">Hujjat qo&apos;shilmagan</p>
                ) : (
                  <div className="space-y-2">
                    {requiredDocs.map((doc, i) => (
                      <div key={i} className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">Hujjat {i + 1}</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={doc.mandatory !== false}
                                onChange={e => setRequiredDocs(d => d.map((r, j) => j === i ? { ...r, mandatory: e.target.checked } : r))}
                                className="w-3.5 h-3.5 rounded accent-red-500"
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400">Majburiy</span>
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" disabled={i === 0} onClick={() => setRequiredDocs(d => { const a = [...d]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a })} className="text-gray-400 hover:text-teal-700 disabled:opacity-30 text-xs leading-none px-0.5">▲</button>
                            <button type="button" disabled={i === requiredDocs.length - 1} onClick={() => setRequiredDocs(d => { const a = [...d]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a })} className="text-gray-400 hover:text-teal-700 disabled:opacity-30 text-xs leading-none px-0.5">▼</button>
                            <button
                              type="button"
                              disabled={!doc.uz.trim() || !!translatingSections[`doc_${i}`]}
                              onClick={() => handleTranslateDoc(i)}
                              className="text-xs text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-40"
                            >
                              {translatingSections[`doc_${i}`] ? 'Tarjimon...' : 'RU/EN tarjima'}
                            </button>
                            <button type="button" onClick={() => setRequiredDocs(d => d.filter((_, j) => j !== i))} className="text-red-500 text-xs hover:underline">O&apos;chirish</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">O&apos;zbek</label>
                            <input value={doc.uz} onChange={e => setRequiredDocs(d => d.map((r, j) => j === i ? { ...r, uz: e.target.value } : r))} className={inp} placeholder="..." />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Rus</label>
                            <input value={doc.ru} onChange={e => setRequiredDocs(d => d.map((r, j) => j === i ? { ...r, ru: e.target.value } : r))} className={inp} placeholder="..." />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ingliz</label>
                            <input value={doc.en} onChange={e => setRequiredDocs(d => d.map((r, j) => j === i ? { ...r, en: e.target.value } : r))} className={inp} placeholder="..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Results date type + results date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Natijalar sanasi turi</label>
                  <select
                    value={form.results_date_type}
                    onChange={e => setForm({ ...form, results_date_type: e.target.value as ResultsDateType, results_date: '' })}
                    className={inp}
                  >
                    <option value="exact">Aniq sana</option>
                    <option value="month">Oy</option>
                    <option value="period">Davr</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {resultsDateLabel(form.results_date_type)}
                  </label>
                  {form.results_date_type === 'exact' ? (
                    <input
                      type="date"
                      value={form.results_date}
                      onChange={e => setForm({ ...form, results_date: e.target.value })}
                      className={inp}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form.results_date}
                      onChange={e => setForm({ ...form, results_date: e.target.value })}
                      placeholder={form.results_date_type === 'month' ? '2025-04' : 'Mart-Aprel'}
                      className={inp}
                    />
                  )}
                </div>
              </div>

              {/* Application URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ariza URL</label>
                <input
                  type="url"
                  value={form.application_url}
                  onChange={e => setForm({ ...form, application_url: e.target.value })}
                  className={inp}
                />
              </div>

              {/* Home order */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bosh sahifa tartibi (1-3, bo'sh = ko'rsatilmaydi)</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.home_order}
                  onChange={e => setForm({ ...form, home_order: e.target.value })}
                  className={inp}
                  placeholder="1, 2 yoki 3"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as Scholarship['status'] })}
                  className={inp}
                >
                  <option value="open">Ochiq</option>
                  <option value="closed">Yopiq</option>
                  <option value="upcoming">Kelayotgan</option>
                </select>
              </div>

              {/* Photos */}
              <div>
                <ImageUpload
                  bucket="scholarships"
                  urls={form.photo_urls}
                  onChange={urls => setForm({ ...form, photo_urls: urls })}
                  multiple
                  label="Rasmlar"
                />
              </div>

              {/* Student results (edit mode only) */}
              {editId && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bizning natijalarimiz</h3>
                  {resultsLoading ? (
                    <div className="text-xs text-gray-400 animate-pulse">Yuklanmoqda...</div>
                  ) : studentResults.length === 0 ? (
                    <div className="text-xs text-gray-400">Natija yo&apos;q</div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">Ism</th>
                            <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">Yil</th>
                            <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">Daraja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentResults.map(r => (
                            <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.student_name}</td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.year}</td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                {degreeLevelLabel[r.degree_level] ?? r.degree_level}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <MediaLinksAdmin links={mediaLinks} onChange={setMediaLinks} />

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Bekor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
