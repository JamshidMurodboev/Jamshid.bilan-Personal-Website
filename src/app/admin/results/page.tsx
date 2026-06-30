'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StudentResult, Scholarship, University } from '@/lib/supabase/types'
import CountrySelect from '@/components/admin/CountrySelect'
import ImageUpload from '@/components/admin/ImageUpload'

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

const degreeLabels: Record<StudentResult['degree_level'], string> = {
  bachelor: 'Bakalavr',
  master: 'Magistr',
  phd: 'PhD',
}

const categoryLabels: Record<string, string> = {
  scholarship_winner: 'Stipendiya g\'olibi',
  tuition_based: 'Pullik universitet',
}

type Category = 'scholarship_winner' | 'tuition_based'

interface FormState {
  student_name: string
  category: Category
  degree_level: StudentResult['degree_level']
  year: string
  country: string
  testimonial: string
  // scholarship_winner fields
  scholarship_id: string
  university_name: string
  // tuition_based fields
  university_id: string
  // shared
  major: string
  language: string
  university_ranking: string
  photo_urls: string[]
}

const emptyForm: FormState = {
  student_name: '',
  category: 'scholarship_winner',
  degree_level: 'bachelor',
  year: new Date().getFullYear().toString(),
  country: '',
  testimonial: '',
  scholarship_id: '',
  university_name: '',
  university_id: '',
  major: '',
  language: '',
  university_ranking: '',
  photo_urls: [],
}

// Inline searchable select component
interface SearchSelectOption {
  value: string
  label: string
  sub?: string
}

function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Tanlang...',
  required,
}: {
  options: SearchSelectOption[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = options.filter((o) =>
    (o.label + ' ' + (o.sub ?? '')).toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(opt: SearchSelectOption) {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden native select for required validation */}
      {required && (
        <select
          required
          value={value}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        >
          <option value="" />
          {options.map((o) => (
            <option key={o.value} value={o.value} />
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`${inp} text-left flex items-center justify-between`}
      >
        <span className={selected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="ml-2 text-gray-400">▾</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qidirish..."
              className="w-full text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">Topilmadi</li>
            )}
            {filtered.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30 ${
                  opt.value === value ? 'bg-teal-50 dark:bg-teal-900/30 font-medium text-teal-700 dark:text-teal-400' : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                <span>{opt.label}</span>
                {opt.sub && (
                  <span className="ml-1 text-xs text-gray-400">{opt.sub}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const [items, setItems] = useState<StudentResult[]>([])
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const [resultsRes, schRes, uniRes] = await Promise.all([
      supabase.from('student_results').select('*').order('created_at', { ascending: false }),
      supabase.from('scholarships').select('id,title,country').order('title'),
      supabase.from('universities').select('id,name,country').order('name'),
    ])
    if (resultsRes.error) setError(resultsRes.error.message)
    else setItems(resultsRes.data ?? [])
    if (!schRes.error) setScholarships((schRes.data ?? []) as Scholarship[])
    if (!uniRes.error) setUniversities((uniRes.data ?? []) as University[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
  }

  function openEdit(item: StudentResult) {
    setEditId(item.id)
    setForm({
      student_name: item.student_name,
      category: (item.category as Category) ?? 'scholarship_winner',
      degree_level: item.degree_level,
      year: item.year.toString(),
      country: item.country,
      testimonial: item.testimonial ?? '',
      scholarship_id: item.scholarship_id ?? '',
      university_name: item.university_name ?? '',
      university_id: item.university_id ?? '',
      major: item.major ?? '',
      language: item.language ?? '',
      university_ranking: item.university_ranking != null ? String(item.university_ranking) : '',
      photo_urls: item.photo_urls ?? [],
    })
    setError(null)
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const base = {
      student_name: form.student_name,
      category: form.category,
      degree_level: form.degree_level,
      year: Number(form.year),
      country: form.country,
      testimonial: form.testimonial || null,
      major: form.major || null,
      language: form.language || null,
      university_ranking: form.university_ranking ? Number(form.university_ranking) : null,
      photo_urls: form.photo_urls.length > 0 ? form.photo_urls : null,
    }

    let payload: Record<string, unknown>

    if (form.category === 'scholarship_winner') {
      payload = {
        ...base,
        scholarship_id: form.scholarship_id || null,
        university_name: form.university_name || null,
        university_id: null,
      }
    } else {
      payload = {
        ...base,
        university_id: form.university_id || null,
        scholarship_id: null,
        university_name: null,
      }
    }

    const supabase = createClient()
    const res = editId
      ? await supabase.from('student_results').update(payload).eq('id', editId)
      : await supabase.from('student_results').insert(payload)

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
    const { error } = await createClient().from('student_results').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  const scholarshipOptions: SearchSelectOption[] = scholarships.map((s) => ({
    value: s.id,
    label: s.title,
    sub: s.country,
  }))

  const universityOptions: SearchSelectOption[] = universities.map((u) => ({
    value: u.id,
    label: u.name,
    sub: u.country,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Talaba natijalari</h1>
        <button
          onClick={openCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Qo&apos;shish
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Talaba</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Kategoriya</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Daraja</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Yil</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Davlat</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {item.student_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {item.category ? categoryLabels[item.category] ?? item.category : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {degreeLabels[item.degree_level]}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.year}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.country}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-teal-700 dark:text-teal-400 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/30"
                    >
                      Tahrir
                    </button>
                    <button
                      onClick={() => del(item.id)}
                      className="text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      O&apos;chir
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Ma&apos;lumot yo&apos;q
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
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editId ? 'Natijani tahrirlash' : 'Yangi natija'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Kategoriya *
                </label>
                <div className="flex gap-3">
                  {(['scholarship_winner', 'tuition_based'] as Category[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                        form.category === cat
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-teal-400'
                      }`}
                    >
                      {categoryLabels[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Talaba ismi *
                </label>
                <input
                  required
                  value={form.student_name}
                  onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                  className={inp}
                  placeholder="To'liq ism"
                />
              </div>

              {/* Scholarship winner fields */}
              {form.category === 'scholarship_winner' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Stipendiya *
                    </label>
                    <SearchSelect
                      options={scholarshipOptions}
                      value={form.scholarship_id}
                      onChange={(v) => setForm({ ...form, scholarship_id: v })}
                      placeholder="Stipendiyani tanlang..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Universitet nomi (o&apos;qish joyi)
                    </label>
                    <input
                      value={form.university_name}
                      onChange={(e) => setForm({ ...form, university_name: e.target.value })}
                      className={inp}
                      placeholder="Masalan: Seoul National University"
                    />
                  </div>
                </>
              )}

              {/* Tuition based fields */}
              {form.category === 'tuition_based' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Universitet *
                  </label>
                  <SearchSelect
                    options={universityOptions}
                    value={form.university_id}
                    onChange={(v) => setForm({ ...form, university_id: v })}
                    placeholder="Universitetni tanlang..."
                    required
                  />
                </div>
              )}

              {/* Shared: major */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Mutaxassislik
                </label>
                <input
                  value={form.major}
                  onChange={(e) => setForm({ ...form, major: e.target.value })}
                  className={inp}
                  placeholder="Masalan: Computer Science"
                />
              </div>

              {/* Shared: language */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  O&apos;qitish tili
                </label>
                <input
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className={inp}
                  placeholder="Masalan: English"
                />
              </div>

              {/* Shared: university_ranking */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Universitet reytingi (ixtiyoriy)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.university_ranking}
                  onChange={(e) => setForm({ ...form, university_ranking: e.target.value })}
                  className={inp}
                  placeholder="Masalan: 150"
                />
              </div>

              {/* Degree */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Daraja *
                </label>
                <select
                  required
                  value={form.degree_level}
                  onChange={(e) =>
                    setForm({ ...form, degree_level: e.target.value as StudentResult['degree_level'] })
                  }
                  className={inp}
                >
                  <option value="bachelor">Bakalavr</option>
                  <option value="master">Magistr</option>
                  <option value="phd">PhD</option>
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Yil *
                </label>
                <input
                  required
                  type="number"
                  min={2000}
                  max={2100}
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className={inp}
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Davlat *
                </label>
                <CountrySelect
                  required
                  value={form.country}
                  onChange={(v) => setForm({ ...form, country: v })}
                  className={inp}
                  placeholder="Davlatni tanlang..."
                />
              </div>

              {/* Testimonial */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Sharh / Fikr
                </label>
                <textarea
                  rows={4}
                  value={form.testimonial}
                  onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                  className={inp}
                  placeholder="Talabaning sharhi..."
                />
              </div>

              {/* Photo upload */}
              <div>
                <ImageUpload
                  bucket="results"
                  urls={form.photo_urls}
                  onChange={(urls) => setForm({ ...form, photo_urls: urls })}
                  multiple
                  label="Rasmlar"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
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
