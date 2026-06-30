'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Testimonial, Scholarship, University } from '@/lib/supabase/types'
import ImageUpload from '@/components/admin/ImageUpload'
import { autoTranslate } from '@/lib/translate'

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

type Category = 'scholarship_winner' | 'tuition_based'

interface FormState {
  student_name: string
  quote_uz: string
  quote_ru: string
  quote_en: string
  category: Category
  scholarship_id: string
  university_id: string
  photo_urls: string[]
}

const emptyForm: FormState = {
  student_name: '',
  quote_uz: '',
  quote_ru: '',
  quote_en: '',
  category: 'scholarship_winner',
  scholarship_id: '',
  university_id: '',
  photo_urls: [],
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [dropdownsLoading, setDropdownsLoading] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient()
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) setError(error.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function loadDropdowns() {
    setDropdownsLoading(true)
    const supabase = createClient()
    const [schRes, uniRes] = await Promise.all([
      supabase.from('scholarships').select('id, title, country').order('title'),
      supabase.from('universities').select('id, name, country').order('name'),
    ])
    if (schRes.data) setScholarships(schRes.data as Scholarship[])
    if (uniRes.data) setUniversities(uniRes.data as University[])
    setDropdownsLoading(false)
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
    loadDropdowns()
  }

  function openEdit(item: Testimonial) {
    setEditId(item.id)
    setForm({
      student_name: item.student_name,
      quote_uz: item.quote_uz,
      quote_ru: item.quote_ru ?? '',
      quote_en: item.quote_en ?? '',
      category: (item.category as Category) ?? 'scholarship_winner',
      scholarship_id: item.scholarship_id ?? '',
      university_id: item.university_id ?? '',
      photo_urls: item.photo_urls ?? [],
    })
    setError(null)
    setShowModal(true)
    loadDropdowns()
  }

  async function handleAutoTranslate() {
    if (!form.quote_uz.trim()) return
    setTranslating(true)
    try {
      const result = await autoTranslate(form.quote_uz)
      setForm(f => ({ ...f, quote_ru: result.ru, quote_en: result.en }))
    } finally {
      setTranslating(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      student_name: form.student_name,
      quote_uz: form.quote_uz,
      quote_ru: form.quote_ru || null,
      quote_en: form.quote_en || null,
      category: form.category,
      scholarship_id: form.category === 'scholarship_winner' ? (form.scholarship_id || null) : null,
      university_id: form.category === 'tuition_based' ? (form.university_id || null) : null,
      photo_urls: form.photo_urls.length > 0 ? form.photo_urls : [],
    }

    const supabase = createClient()
    const res = editId
      ? await supabase.from('testimonials').update(payload).eq('id', editId)
      : await supabase.from('testimonials').insert({ ...payload, sort_order: items.length })

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
    const { error } = await createClient().from('testimonials').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const a = items[index]
    const b = items[target]
    const supabase = createClient()
    await Promise.all([
      supabase.from('testimonials').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('testimonials').update({ sort_order: a.sort_order }).eq('id', b.id),
    ])
    load()
  }

  function categoryLabel(cat?: string) {
    if (cat === 'scholarship_winner') return 'Grant g\'olibi'
    if (cat === 'tuition_based') return 'Kontrakt asosida'
    return '—'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Talaba fikrlari</h1>
        <button
          onClick={openCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Qo'shish
        </button>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-teal-700 dark:text-teal-400 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-2 py-3 w-10"></th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Ism</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Quote</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Kategoriya</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium w-12">Sort</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 disabled:opacity-30 text-xs leading-none"
                      >▲</button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === items.length - 1}
                        className="text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 disabled:opacity-30 text-xs leading-none"
                      >▼</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{item.student_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{item.quote_uz}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.category === 'scholarship_winner'
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}>
                      {categoryLabel(item.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">{item.sort_order}</td>
                  <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-teal-700 dark:text-teal-400 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/30"
                    >Tahrir</button>
                    <button
                      onClick={() => del(item.id)}
                      className="text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    >O'chir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                    Ma'lumot yo'q
                  </td>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editId ? 'Fikrni tahrirlash' : 'Yangi fikr'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >×</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Student name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Talaba ismi *</label>
                <input
                  required
                  value={form.student_name}
                  onChange={e => setForm({ ...form, student_name: e.target.value })}
                  className={inp}
                  placeholder="To'liq ism"
                />
              </div>

              {/* Photo upload */}
              <div>
                <ImageUpload
                  bucket="testimonials"
                  urls={form.photo_urls}
                  onChange={urls => setForm({ ...form, photo_urls: urls })}
                  multiple={false}
                  label="Talaba rasmi"
                />
              </div>

              {/* Quote UZ */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Sharh (UZ) *</label>
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={translating || !form.quote_uz.trim()}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:underline disabled:opacity-40"
                  >
                    {translating ? 'Tarjima...' : 'Auto-tarjima'}
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  value={form.quote_uz}
                  onChange={e => setForm({ ...form, quote_uz: e.target.value })}
                  className={inp}
                  placeholder="O'zbekcha sharh..."
                />
              </div>

              {/* Quote RU */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Sharh (RU)</label>
                <textarea
                  rows={2}
                  value={form.quote_ru}
                  onChange={e => setForm({ ...form, quote_ru: e.target.value })}
                  className={inp}
                  placeholder="Ruscha sharh..."
                />
              </div>

              {/* Quote EN */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Sharh (EN)</label>
                <textarea
                  rows={2}
                  value={form.quote_en}
                  onChange={e => setForm({ ...form, quote_en: e.target.value })}
                  className={inp}
                  placeholder="English quote..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Kategoriya *</label>
                <select
                  required
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as Category, scholarship_id: '', university_id: '' })}
                  className={inp}
                >
                  <option value="scholarship_winner">Grant g'olibi (Scholarship Winner)</option>
                  <option value="tuition_based">Kontrakt asosida (Tuition-based)</option>
                </select>
              </div>

              {/* Scholarship select */}
              {form.category === 'scholarship_winner' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Grant *</label>
                  {dropdownsLoading ? (
                    <div className="text-xs text-gray-400 dark:text-gray-500 py-2">Yuklanmoqda...</div>
                  ) : (
                    <select
                      required
                      value={form.scholarship_id}
                      onChange={e => setForm({ ...form, scholarship_id: e.target.value })}
                      className={inp}
                    >
                      <option value="">— Grantni tanlang —</option>
                      {scholarships.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.country})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* University select */}
              {form.category === 'tuition_based' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Universitet *</label>
                  {dropdownsLoading ? (
                    <div className="text-xs text-gray-400 dark:text-gray-500 py-2">Yuklanmoqda...</div>
                  ) : (
                    <select
                      required
                      value={form.university_id}
                      onChange={e => setForm({ ...form, university_id: e.target.value })}
                      className={inp}
                    >
                      <option value="">— Universitetni tanlang —</option>
                      {universities.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.country})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Actions */}
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
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
