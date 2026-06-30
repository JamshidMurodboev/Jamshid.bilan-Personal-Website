'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { University, UniversityMajor, StudentResult } from '@/lib/supabase/types'
import CountrySelect from '@/components/admin/CountrySelect'
import ImageUpload from '@/components/admin/ImageUpload'
import { autoTranslate } from '@/lib/translate'

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

type MajorRow = {
  name: string
  degree: string
  language: string
  tuition: string
  currency: 'USD' | 'UZS' | 'EUR' | 'TL'
}

const emptyMajor = (): MajorRow => ({ name: '', degree: '', language: '', tuition: '', currency: 'USD' })

type FormState = {
  name: string
  country: string
  city: string
  website_url: string
  type: University['type']
  ranking: string
  description_uz: string
  description_ru: string
  description_en: string
  photo_urls: string[]
}

const emptyForm: FormState = {
  name: '',
  country: '',
  city: '',
  website_url: '',
  type: 'public',
  ranking: '',
  description_uz: '',
  description_ru: '',
  description_en: '',
  photo_urls: [],
}

const DEGREE_OPTIONS = [
  { value: '', label: 'Daraja tanlang...' },
  { value: 'bachelor', label: "Bakalavriat" },
  { value: 'master_thesis', label: "Magistratura (dissertatsiya bilan)" },
  { value: 'master_no_thesis', label: "Magistratura (dissertatsiyasiz)" },
  { value: 'phd', label: "PhD / Doktorantura" },
]

export default function UniversitiesPage() {
  const [items, setItems] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [majors, setMajors] = useState<MajorRow[]>([emptyMajor()])
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [studentResults, setStudentResults] = useState<StudentResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient()
      .from('universities')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function loadMajors(universityId: string) {
    const { data } = await createClient()
      .from('university_majors')
      .select('*')
      .eq('university_id', universityId)
      .order('sort_order', { ascending: true })
    if (data && data.length > 0) {
      setMajors(data.map((m: UniversityMajor) => ({
        name: m.name,
        degree: m.degree ?? '',
        language: m.language ?? '',
        tuition: m.tuition?.toString() ?? '',
        currency: m.currency,
      })))
    } else {
      setMajors([emptyMajor()])
    }
  }

  async function loadStudentResults(universityId: string) {
    setResultsLoading(true)
    const { data } = await createClient()
      .from('student_results')
      .select('*')
      .eq('university_id', universityId)
      .order('year', { ascending: false })
    setStudentResults(data ?? [])
    setResultsLoading(false)
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setMajors([emptyMajor()])
    setStudentResults([])
    setError(null)
    setShowModal(true)
  }

  function openEdit(item: University) {
    setEditId(item.id)
    setForm({
      name: item.name,
      country: item.country,
      city: item.city ?? '',
      website_url: item.website_url ?? '',
      type: item.type,
      ranking: item.ranking?.toString() ?? '',
      description_uz: item.description_uz ?? '',
      description_ru: item.description_ru ?? '',
      description_en: item.description_en ?? '',
      photo_urls: item.photo_urls ?? [],
    })
    setError(null)
    setShowModal(true)
    loadMajors(item.id)
    loadStudentResults(item.id)
  }

  async function handleTranslate() {
    if (!form.description_uz.trim()) return
    setTranslating(true)
    try {
      const result = await autoTranslate(form.description_uz)
      setForm(f => ({ ...f, description_ru: result.ru, description_en: result.en }))
    } finally {
      setTranslating(false)
    }
  }

  async function saveMajors(universityId: string) {
    const supabase = createClient()
    await supabase.from('university_majors').delete().eq('university_id', universityId)
    const rows = majors
      .filter(m => m.name.trim())
      .map((m, i) => ({
        university_id: universityId,
        name: m.name.trim(),
        degree: m.degree || null,
        language: m.language.trim() || null,
        tuition: m.tuition ? Number(m.tuition) : null,
        currency: m.currency,
        sort_order: i,
      }))
    if (rows.length > 0) {
      await supabase.from('university_majors').insert(rows)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name,
      country: form.country,
      city: form.city || null,
      website_url: form.website_url || null,
      type: form.type,
      ranking: form.ranking ? Number(form.ranking) : null,
      description_uz: form.description_uz || null,
      description_ru: form.description_ru || null,
      description_en: form.description_en || null,
      photo_urls: form.photo_urls.length > 0 ? form.photo_urls : null,
    }

    const supabase = createClient()

    if (editId) {
      const { error: updateError } = await supabase
        .from('universities')
        .update(payload)
        .eq('id', editId)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
      await saveMajors(editId)
    } else {
      const { data, error: insertError } = await supabase
        .from('universities')
        .insert(payload)
        .select('id')
        .single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Insert failed')
        setSaving(false)
        return
      }
      await saveMajors(data.id)
    }

    setShowModal(false)
    load()
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('universities').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  function setMajorField(index: number, field: keyof MajorRow, value: string) {
    setMajors(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function addMajor() {
    if (majors.length >= 35) return
    setMajors(prev => [...prev, emptyMajor()])
  }

  function removeMajor(index: number) {
    setMajors(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Universitetlar</h1>
        <button
          onClick={openCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Qo'shish
        </button>
      </div>

      {error && !showModal && (
        <div className="text-red-600 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
      )}

      {loading ? (
        <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Davlat</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Turi</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Reyting</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.country}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'public' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>
                      {item.type === 'public' ? 'Davlat' : 'Xususiy'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.ranking ?? '—'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-teal-700 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/30">Tahrir</button>
                    <button onClick={() => del(item.id)} className="text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30">O'chir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Ma'lumot yo'q</td></tr>
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editId ? 'Universitetni tahrirlash' : 'Yangi universitet'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nomi *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} placeholder="Universitet nomi" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Davlat *</label>
                  <CountrySelect value={form.country} onChange={v => setForm({ ...form, country: v })} required className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Shahar</label>
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inp} placeholder="Shahar nomi" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Turi</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as University['type'] })} className={inp}>
                    <option value="public">Davlat</option>
                    <option value="private">Xususiy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Reyting</label>
                  <input type="number" min={1} value={form.ranking} onChange={e => setForm({ ...form, ranking: e.target.value })} className={inp} placeholder="Masalan: 150" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Veb-sayt</label>
                  <input type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} className={inp} placeholder="https://..." />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tavsif (UZ)</label>
                  <button type="button" onClick={handleTranslate} disabled={translating || !form.description_uz.trim()} className="text-xs text-teal-700 dark:text-teal-400 font-medium hover:underline disabled:opacity-40">
                    {translating ? 'Tarjimon...' : 'Avtotarjima (RU/EN)'}
                  </button>
                </div>
                <textarea rows={3} value={form.description_uz} onChange={e => setForm({ ...form, description_uz: e.target.value })} className={inp} placeholder="O'zbek tilida tavsif..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tavsif (RU)</label>
                <textarea rows={3} value={form.description_ru} onChange={e => setForm({ ...form, description_ru: e.target.value })} className={inp} placeholder="Описание на русском..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tavsif (EN)</label>
                <textarea rows={3} value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} className={inp} placeholder="Description in English..." />
              </div>

              <div>
                <ImageUpload bucket="universities" urls={form.photo_urls} onChange={urls => setForm({ ...form, photo_urls: urls })} multiple label="Rasmlar" />
              </div>

              {/* Majors — redesigned as cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Yo'nalishlar</label>
                  <span className="text-xs text-gray-400">{majors.length}/35</span>
                </div>
                <div className="space-y-3">
                  {majors.map((m, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Yo'nalish {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMajor(i)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium hover:underline"
                        >
                          O'chirish
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Yo'nalish nomi *</label>
                          <input
                            value={m.name}
                            onChange={e => setMajorField(i, 'name', e.target.value)}
                            placeholder="Masalan: Kompyuter muhandisligi"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Daraja</label>
                          <select
                            value={m.degree}
                            onChange={e => setMajorField(i, 'degree', e.target.value)}
                            className={inp}
                          >
                            {DEGREE_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">O'qitish tili</label>
                          <input
                            value={m.language}
                            onChange={e => setMajorField(i, 'language', e.target.value)}
                            placeholder="Ingliz tili, Turk tili..."
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">To'lov miqdori</label>
                          <input
                            type="number"
                            min={0}
                            value={m.tuition}
                            onChange={e => setMajorField(i, 'tuition', e.target.value)}
                            placeholder="0"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Valyuta</label>
                          <select
                            value={m.currency}
                            onChange={e => setMajorField(i, 'currency', e.target.value as MajorRow['currency'])}
                            className={inp}
                          >
                            <option value="USD">USD — Dollar</option>
                            <option value="UZS">UZS — So'm</option>
                            <option value="EUR">EUR — Evro</option>
                            <option value="TL">TL — Turk lirasi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {majors.length < 35 && (
                  <button type="button" onClick={addMajor} className="mt-3 text-sm text-teal-700 dark:text-teal-400 font-medium hover:underline">
                    + Yo'nalish qo'shish
                  </button>
                )}
              </div>

              {/* Student results (edit mode only) */}
              {editId && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bizning natijalarimiz</h3>
                  {resultsLoading ? (
                    <div className="text-xs text-gray-400 animate-pulse">Yuklanmoqda...</div>
                  ) : studentResults.length === 0 ? (
                    <div className="text-xs text-gray-400">Natijalar yo'q</div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-medium">Talaba</th>
                            <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-medium">Davlat</th>
                            <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-medium">Daraja</th>
                            <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-medium">Yil</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentResults.map(r => (
                            <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                              <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{r.student_name}</td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.country}</td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.degree_level}</td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.year}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-lg disabled:opacity-60">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
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
