'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { University, UniversityMajor, StudentResult, RequiredDocument } from '@/lib/supabase/types'
import CountrySelect from '@/components/admin/CountrySelect'
import LanguageSelect from '@/components/admin/LanguageSelect'
import ImageUpload from '@/components/admin/ImageUpload'
import { autoTranslate } from '@/lib/translate'
import { slugify } from '@/lib/slugify'
import MediaLinksAdmin from '@/components/admin/MediaLinksAdmin'
import type { MediaLink } from '@/lib/supabase/types'

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

type MajorRow = {
  name: string
  degree: string
  language: string
  tuition: string
  currency: 'USD' | 'UZS' | 'EUR' | 'TL'
}

const emptyMajor = (): MajorRow => ({ name: '', degree: '', language: '', tuition: '', currency: 'USD' })

type DocRow = RequiredDocument & { mandatory?: boolean }

type FormState = {
  name: string
  country: string
  city: string
  website_url: string
  type: University['type']
  status: University['status']
  ranking: string
  description_uz: string
  description_ru: string
  description_en: string
  photo_urls: string[]
  home_order: string
  slug: string
  tuition_estimated: boolean
  tuition_note_uz: string
  tuition_note_ru: string
  tuition_note_en: string
}

const emptyForm: FormState = {
  name: '',
  country: '',
  city: '',
  website_url: '',
  type: 'public',
  status: 'open',
  ranking: '',
  description_uz: '',
  description_ru: '',
  description_en: '',
  photo_urls: [],
  home_order: '',
  slug: '',
  tuition_estimated: false,
  tuition_note_uz: '',
  tuition_note_ru: '',
  tuition_note_en: '',
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
  const [translatingSections, setTranslatingSections] = useState<Record<string, boolean>>({})
  const [studentResults, setStudentResults] = useState<StudentResult[]>([])
  const [requiredDocs, setRequiredDocs] = useState<DocRow[]>([])
  const [mediaLinks, setMediaLinks] = useState<MediaLink[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [showDocsPreview, setShowDocsPreview] = useState(false)

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
    setRequiredDocs([])
    setMediaLinks([])
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
      status: item.status ?? 'open',
      ranking: item.ranking?.toString() ?? '',
      description_uz: item.description_uz ?? '',
      description_ru: item.description_ru ?? '',
      description_en: item.description_en ?? '',
      photo_urls: item.photo_urls ?? [],
      home_order: item.home_order?.toString() ?? '',
      slug: item.slug ?? slugify(item.name),
      tuition_estimated: (item as any).tuition_estimated ?? false,
      tuition_note_uz: (item as any).tuition_note_uz ?? '',
      tuition_note_ru: (item as any).tuition_note_ru ?? '',
      tuition_note_en: (item as any).tuition_note_en ?? '',
    })
    setRequiredDocs((item as any).required_documents ?? [])
    setMediaLinks((item as any).media_links ?? [])
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
      setForm(f => ({ ...f, description_ru: result.ru || f.description_ru, description_en: result.en || f.description_en }))
    } finally {
      setTranslating(false)
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
      status: form.status,
      ranking: form.ranking ? Number(form.ranking) : null,
      description_uz: form.description_uz || null,
      description_ru: form.description_ru || null,
      description_en: form.description_en || null,
      photo_urls: form.photo_urls.length > 0 ? form.photo_urls : null,
      required_documents: requiredDocs.filter(d => d.uz.trim()).length > 0 ? requiredDocs.filter(d => d.uz.trim()) : null,
      home_order: form.home_order ? parseInt(form.home_order) : null,
      slug: form.slug || slugify(form.name) || null,
      media_links: mediaLinks.filter(l => l.url.trim()).length > 0 ? mediaLinks.filter(l => l.url.trim()) : null,
      tuition_estimated: form.tuition_estimated,
      tuition_note_uz: form.tuition_estimated ? (form.tuition_note_uz || null) : null,
      tuition_note_ru: form.tuition_estimated ? (form.tuition_note_ru || null) : null,
      tuition_note_en: form.tuition_estimated ? (form.tuition_note_en || null) : null,
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

      {showDocsPreview && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Hujjatlar ko&apos;rinishi (ommaviy sahifa)</h3>
              <button onClick={() => setShowDocsPreview(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {requiredDocs.filter(d => d.uz.trim()).map((doc, i) => (
                  <div key={i} className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                    <span className="text-base flex-shrink-0">{(doc as any).icon || '📄'}</span>
                    <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{doc.uz}</span>
                    {doc.mandatory === false ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Ixtiyoriy</span>
                    ) : doc.mandatory === true ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600">Majburiy</span>
                    ) : null}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowDocsPreview(false)} className="mt-4 w-full bg-teal-700 text-white py-2.5 rounded-lg font-medium text-sm">
                Yopish
              </button>
            </div>
          </div>
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
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className={inp} placeholder="Universitet nomi" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">URL Slug (avtomatik)</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inp} placeholder="anadolu-universiteti" />
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
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Holat</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as University['status'] })} className={inp}>
                    <option value="open">Ochiq</option>
                    <option value="closed">Yopiq</option>
                    <option value="upcoming">Tez orada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Reyting</label>
                  <input type="number" min={1} value={form.ranking} onChange={e => setForm({ ...form, ranking: e.target.value })} className={inp} placeholder="Masalan: 150" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Bosh sahifa tartibi (1-3)</label>
                  <input type="number" min={1} max={99} value={form.home_order} onChange={e => setForm({ ...form, home_order: e.target.value })} className={inp} placeholder="1, 2 yoki 3" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Veb-sayt</label>
                  <input type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} className={inp} placeholder="https://..." />
                </div>
              </div>

              {/* Tuition estimated */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.tuition_estimated} onChange={e => setForm({ ...form, tuition_estimated: e.target.checked })} className="w-4 h-4 rounded accent-teal-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Kutilgan narx (oldingi yil asosida)</span>
                </label>
                {form.tuition_estimated && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Izoh (UZ)</label>
                      <input value={form.tuition_note_uz} onChange={e => setForm({ ...form, tuition_note_uz: e.target.value })} className={inp} placeholder="Masalan: Narx oldingi yil asosida" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Izoh (RU)</label>
                      <input value={form.tuition_note_ru} onChange={e => setForm({ ...form, tuition_note_ru: e.target.value })} className={inp} placeholder="Цена основана на прошлом году" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Izoh (EN)</label>
                      <input value={form.tuition_note_en} onChange={e => setForm({ ...form, tuition_note_en: e.target.value })} className={inp} placeholder="Price based on previous year" />
                    </div>
                  </div>
                )}
              </div>

              {/* Description UZ + auto-translate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
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
                <textarea rows={4} value={form.description_uz} onChange={e => setForm({ ...form, description_uz: e.target.value })} className={inp} placeholder="O'zbek tilida tavsif..." />
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

              {/* Required Documents */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Talab qilinadigan hujjatlar</h3>
                  <button type="button" onClick={() => setRequiredDocs(d => [...d, { uz: '', ru: '', en: '', mandatory: true }])} className="text-xs text-teal-700 dark:text-teal-400 font-medium hover:underline">+ Qo&apos;shish</button>
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
                          <LanguageSelect value={m.language} onChange={v => setMajorField(i, 'language', v)} className={inp} />
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

              {/* Media Links */}
              <MediaLinksAdmin links={mediaLinks} onChange={setMediaLinks} />

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
                {requiredDocs.filter(d => d.uz.trim()).length > 0 && (
                  <button type="button" onClick={() => setShowDocsPreview(true)} className="border border-teal-600 dark:border-teal-500 text-teal-700 dark:text-teal-400 text-sm font-medium px-4 py-3 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20">
                    Hujjatlarni ko&apos;rish
                  </button>
                )}
                <button type="submit" disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-lg disabled:opacity-60">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
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
