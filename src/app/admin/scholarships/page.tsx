'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Scholarship, StudentResult } from '@/lib/supabase/types'
import CountrySelect from '@/components/admin/CountrySelect'
import ImageUpload from '@/components/admin/ImageUpload'
import { autoTranslate } from '@/lib/translate'

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
}

type FormState = typeof emptyForm

// Required document row
type DocRow = { uz: string; ru: string; en: string }
const emptyDoc = (): DocRow => ({ uz: '', ru: '', en: '' })

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [studentResults, setStudentResults] = useState<StudentResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [requiredDocs, setRequiredDocs] = useState<DocRow[]>([])

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
    })
    setRequiredDocs((item as any).required_documents ?? [])
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
        description_ru: f.description_ru || result.ru,
        description_en: f.description_en || result.en,
      }))
    } finally {
      setTranslating(false)
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

    const payload = {
      title: form.title,
      country: form.country,
      university: form.university || null,
      coverage: form.coverage ? form.coverage.split(',').map(s => s.trim()).filter(Boolean) : [],
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
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Davlat</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Kategoriya</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={inp}
                />
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
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Qamrov (vergul bilan)</label>
                <input
                  value={form.coverage}
                  onChange={e => setForm({ ...form, coverage: e.target.value })}
                  placeholder="Turar joy, Ovqat, Stipendiya"
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
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Grant Jarayoni</h3>
                <div className="space-y-0">
                  {[
                    { label: 'Ariza davri', typeKey: 'application_period_type', valueKey: 'application_period', num: 1, color: 'bg-teal-500' },
                    { label: 'Suhbat / Imtihon davri', typeKey: 'interview_exam_period_type', valueKey: 'interview_exam_period', num: 2, color: 'bg-blue-500' },
                    { label: 'Natijalar davri', typeKey: 'results_period_type', valueKey: 'results_period', num: 3, color: 'bg-purple-500' },
                  ].map((step, idx, arr) => (
                    <div key={step.typeKey} className="flex gap-3">
                      {/* Timeline line + circle */}
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full ${step.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {step.num}
                        </div>
                        {idx < arr.length - 1 && <div className="w-0.5 bg-gray-200 dark:bg-gray-700 flex-1 my-1" style={{minHeight: '1.5rem'}} />}
                      </div>
                      {/* Card */}
                      <div className={`flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 ${idx < arr.length - 1 ? 'mb-2' : ''}`}>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{step.label}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <select
                              value={(form as any)[step.typeKey]}
                              onChange={e => setForm({ ...form, [step.typeKey]: e.target.value, [step.valueKey]: '' })}
                              className={inp}
                            >
                              <option value="exact">Aniq sana</option>
                              <option value="month">Oy</option>
                              <option value="period">Davr</option>
                            </select>
                          </div>
                          <div>
                            {(form as any)[step.typeKey] === 'exact' ? (
                              <input type="date" value={(form as any)[step.valueKey]} onChange={e => setForm({ ...form, [step.valueKey]: e.target.value })} className={inp} />
                            ) : (
                              <input type="text" value={(form as any)[step.valueKey]} onChange={e => setForm({ ...form, [step.valueKey]: e.target.value })} placeholder={(form as any)[step.typeKey] === 'month' ? '2025-04' : 'Mart – Aprel'} className={inp} />
                            )}
                          </div>
                        </div>
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
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">Hujjat {i + 1}</span>
                          <button type="button" onClick={() => setRequiredDocs(d => d.filter((_, j) => j !== i))} className="text-red-500 text-xs hover:underline">O&apos;chirish</button>
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

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Qabul Muddati (Boshlanish)
                  </label>
                  <input
                    type="date"
                    value={form.open_date}
                    onChange={e => setForm({ ...form, open_date: e.target.value })}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Qabul Muddati (Tugash)
                  </label>
                  <input
                    type="date"
                    value={form.close_date}
                    onChange={e => setForm({ ...form, close_date: e.target.value })}
                    className={inp}
                  />
                </div>
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
