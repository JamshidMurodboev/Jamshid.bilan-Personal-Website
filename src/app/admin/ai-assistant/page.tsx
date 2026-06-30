'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'
import type { UploadBucket } from '@/lib/upload'

type ContentType = 'scholarship' | 'university' | 'student_result' | 'news' | 'testimonial'

const TYPE_LABELS: Record<ContentType, string> = {
  scholarship: 'Grant',
  university: 'Universitet',
  student_result: 'Talaba natijasi',
  news: 'Yangilik',
  testimonial: 'Talaba fikri',
}

const BUCKET_MAP: Record<ContentType, UploadBucket> = {
  scholarship: 'scholarships',
  university: 'universities',
  student_result: 'results',
  news: 'news',
  testimonial: 'testimonials',
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const inp = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500'

function Field({ label, value, onChange, multiline, placeholder }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {multiline
        ? <textarea className={inp} rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input className={inp} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <select
        className={inp}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function ScholarshipForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  const coverageItems = ['Turar joy', 'Ovqat', 'Stipendiya', "O'quv to'lovi", 'Tibbiy sug\'urta', "Yo'l xarajatlari"]
  const coverageArr: string[] = Array.isArray(data.coverage) ? data.coverage : (data.coverage ? data.coverage.split(',').map((s: string) => s.trim()).filter(Boolean) : [])

  function toggleCoverage(item: string) {
    const next = coverageArr.includes(item)
      ? coverageArr.filter(c => c !== item)
      : [...coverageArr, item]
    set('coverage', next)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Nomi" value={data.title || ''} onChange={v => set('title', v)} />
      <Field label="Davlat" value={data.country || ''} onChange={v => set('country', v)} />
      <Field label="Universitet" value={data.university || ''} onChange={v => set('university', v)} />
      <Field label="Ariza URL" value={data.application_url || ''} onChange={v => set('application_url', v)} />
      <Field label="Ochilish sanasi" value={data.open_date || ''} onChange={v => set('open_date', v)} />
      <Field label="Yopilish sanasi" value={data.close_date || ''} onChange={v => set('close_date', v)} />
      <Field label="Natijalar sanasi" value={data.results_date || ''} onChange={v => set('results_date', v)} />
      <SelectField label="Holat" value={data.status || 'upcoming'} onChange={v => set('status', v)}
        options={[{ value: 'open', label: 'Ochiq' }, { value: 'closed', label: 'Yopiq' }, { value: 'upcoming', label: 'Kelayotgan' }]} />
      <SelectField label="Kategoriya" value={data.category || 'fully_funded'} onChange={v => set('category', v)}
        options={[{ value: 'fully_funded', label: "To'liq grant" }, { value: 'partially_funded', label: "Qisman grant" }, { value: 'self_funded', label: "O'z mablag'i" }]} />
      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Qamrov</label>
        <div className="flex flex-wrap gap-2">
          {coverageItems.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => toggleCoverage(item)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                coverageArr.includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-teal-400'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2"><Field label="Tavsif (UZ)" value={data.description_uz || ''} onChange={v => set('description_uz', v)} multiline /></div>
      <div className="md:col-span-2"><Field label="Tavsif (RU)" value={data.description_ru || ''} onChange={v => set('description_ru', v)} multiline /></div>
      <div className="md:col-span-2"><Field label="Tavsif (EN)" value={data.description_en || ''} onChange={v => set('description_en', v)} multiline /></div>
    </div>
  )
}

function UniversityForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  const majors: any[] = data.majors || []

  function addMajor() {
    set('majors', [...majors, { name: '', language: '', tuition: '' }])
  }

  function removeMajor(i: number) {
    set('majors', majors.filter((_: any, idx: number) => idx !== i))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Nomi" value={data.name || ''} onChange={v => set('name', v)} />
      <Field label="Davlat" value={data.country || ''} onChange={v => set('country', v)} />
      <Field label="Shahar" value={data.city || ''} onChange={v => set('city', v)} />
      <Field label="Veb-sayt" value={data.website_url || ''} onChange={v => set('website_url', v)} />
      <Field label="Reyting" value={data.ranking?.toString() || ''} onChange={v => set('ranking', v ? parseInt(v) : null)} />
      <SelectField label="Turi" value={data.type || 'public'} onChange={v => set('type', v)}
        options={[{ value: 'public', label: 'Davlat' }, { value: 'private', label: 'Xususiy' }]} />
      <div className="md:col-span-2"><Field label="Tavsif (UZ)" value={data.description_uz || ''} onChange={v => set('description_uz', v)} multiline /></div>
      <div className="md:col-span-2"><Field label="Tavsif (RU)" value={data.description_ru || ''} onChange={v => set('description_ru', v)} multiline /></div>
      <div className="md:col-span-2"><Field label="Tavsif (EN)" value={data.description_en || ''} onChange={v => set('description_en', v)} multiline /></div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Mutaxassisliklar</span>
          <button type="button" onClick={addMajor} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">+ Qo'shish</button>
        </div>
        <div className="space-y-2">
          {majors.map((m: any, i: number) => (
            <div key={i} className="grid grid-cols-4 gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input className="col-span-2 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" placeholder="Nomi" value={m.name || ''} onChange={e => { const ms = [...majors]; ms[i] = { ...ms[i], name: e.target.value }; set('majors', ms) }} />
              <input className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" placeholder="Til" value={m.language || ''} onChange={e => { const ms = [...majors]; ms[i] = { ...ms[i], language: e.target.value }; set('majors', ms) }} />
              <div className="flex gap-1">
                <input className="flex-1 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" placeholder="Narx" value={m.tuition || ''} onChange={e => { const ms = [...majors]; ms[i] = { ...ms[i], tuition: e.target.value }; set('majors', ms) }} />
                <button type="button" onClick={() => removeMajor(i)} className="text-red-400 hover:text-red-600 text-sm px-1">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StudentResultForm({ data, onChange, scholarships, universities }: { data: any; onChange: (d: any) => void; scholarships: any[]; universities: any[] }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Talaba ismi" value={data.student_name || ''} onChange={v => set('student_name', v)} />
      <Field label="Davlat" value={data.country || ''} onChange={v => set('country', v)} />
      <Field label="Mutaxassislik" value={data.major || ''} onChange={v => set('major', v)} />
      <Field label="Til" value={data.language || ''} onChange={v => set('language', v)} />
      <Field label="Yil" value={data.year?.toString() || ''} onChange={v => set('year', v ? parseInt(v) : null)} />
      <Field label="Universitet reytingi" value={data.university_ranking?.toString() || ''} onChange={v => set('university_ranking', v ? parseInt(v) : null)} />
      <SelectField label="Daraja" value={data.degree_level || 'bachelor'} onChange={v => set('degree_level', v)}
        options={[{ value: 'bachelor', label: 'Bakalavr' }, { value: 'master', label: 'Magistr' }, { value: 'phd', label: 'PhD' }]} />
      <SelectField label="Kategoriya" value={data.category || 'scholarship_winner'} onChange={v => set('category', v)}
        options={[{ value: 'scholarship_winner', label: 'Grant g\'olibi' }, { value: 'tuition_based', label: 'Kontrakt' }]} />
      {data.category === 'scholarship_winner' && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Grant</label>
            <select className={inp} value={data.scholarship_id || ''} onChange={e => set('scholarship_id', e.target.value)}>
              <option value="">— Tanlang —</option>
              {scholarships.map(s => <option key={s.id} value={s.id}>{s.title} ({s.country})</option>)}
            </select>
          </div>
          <Field label="Universitet nomi" value={data.university_name || ''} onChange={v => set('university_name', v)} />
        </>
      )}
      {data.category === 'tuition_based' && (
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Universitet</label>
          <select className={inp} value={data.university_id || ''} onChange={e => set('university_id', e.target.value)}>
            <option value="">— Tanlang —</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name} ({u.country})</option>)}
          </select>
        </div>
      )}
      <div className="md:col-span-2"><Field label="Izoh" value={data.testimonial || ''} onChange={v => set('testimonial', v)} multiline /></div>
    </div>
  )
}

function NewsForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  return (
    <div className="grid grid-cols-1 gap-4">
      <Field label="Sarlavha (UZ)" value={data.title_uz || ''} onChange={v => set('title_uz', v)} />
      <Field label="Sarlavha (RU)" value={data.title_ru || ''} onChange={v => set('title_ru', v)} />
      <Field label="Sarlavha (EN)" value={data.title_en || ''} onChange={v => set('title_en', v)} />
      <Field label="Slug" value={data.slug || ''} onChange={v => set('slug', v)} placeholder="url-slug" />
      <Field label="Matn (UZ)" value={data.body_uz || ''} onChange={v => set('body_uz', v)} multiline />
      <Field label="Matn (RU)" value={data.body_ru || ''} onChange={v => set('body_ru', v)} multiline />
      <Field label="Matn (EN)" value={data.body_en || ''} onChange={v => set('body_en', v)} multiline />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="news_published" checked={!!data.published} onChange={e => set('published', e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 text-teal-600" />
        <label htmlFor="news_published" className="text-xs font-medium text-gray-500 dark:text-gray-400">Nashr qilish</label>
      </div>
    </div>
  )
}

function TestimonialForm({ data, onChange, scholarships, universities }: { data: any; onChange: (d: any) => void; scholarships: any[]; universities: any[] }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Talaba ismi" value={data.student_name || ''} onChange={v => set('student_name', v)} />
      <SelectField label="Kategoriya" value={data.category || 'scholarship_winner'} onChange={v => set('category', v)}
        options={[{ value: 'scholarship_winner', label: 'Grant g\'olibi' }, { value: 'tuition_based', label: 'Kontrakt' }]} />
      {data.category === 'scholarship_winner' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Grant</label>
          <select className={inp} value={data.scholarship_id || ''} onChange={e => set('scholarship_id', e.target.value)}>
            <option value="">— Tanlang —</option>
            {scholarships.map(s => <option key={s.id} value={s.id}>{s.title} ({s.country})</option>)}
          </select>
        </div>
      )}
      {data.category === 'tuition_based' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Universitet</label>
          <select className={inp} value={data.university_id || ''} onChange={e => set('university_id', e.target.value)}>
            <option value="">— Tanlang —</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name} ({u.country})</option>)}
          </select>
        </div>
      )}
      <div className="md:col-span-2"><Field label="Iqtibos (UZ)" value={data.quote_uz || ''} onChange={v => set('quote_uz', v)} multiline /></div>
      <div className="md:col-span-2"><Field label="Iqtibos (RU)" value={data.quote_ru || ''} onChange={v => set('quote_ru', v)} multiline /></div>
      <div className="md:col-span-2"><Field label="Iqtibos (EN)" value={data.quote_en || ''} onChange={v => set('quote_en', v)} multiline /></div>
      <Field label="Natija (UZ)" value={data.outcome_uz || ''} onChange={v => set('outcome_uz', v)} />
      <Field label="Natija (RU)" value={data.outcome_ru || ''} onChange={v => set('outcome_ru', v)} />
      <Field label="Natija (EN)" value={data.outcome_en || ''} onChange={v => set('outcome_en', v)} />
    </div>
  )
}

async function saveToSupabase(type: ContentType, data: any): Promise<string | null> {
  const supabase = createClient()
  const now = new Date().toISOString()
  const photoUrls = data.photo_urls || []

  if (type === 'scholarship') {
    const coverage = Array.isArray(data.coverage) ? data.coverage : (data.coverage ? data.coverage.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
    const { error } = await supabase.from('scholarships').insert({
      ...data,
      coverage,
      photo_urls: photoUrls,
      created_at: now,
      updated_at: now,
    })
    return error?.message || null
  }

  if (type === 'university') {
    const majors = data.majors || []
    const { data: uni, error } = await supabase.from('universities').insert({
      name: data.name, country: data.country, city: data.city,
      description_uz: data.description_uz, description_ru: data.description_ru, description_en: data.description_en,
      website_url: data.website_url, type: data.type || 'public', ranking: data.ranking,
      programs: [], photo_urls: photoUrls, created_at: now, updated_at: now,
    }).select('id').single()
    if (error) return error.message
    if (majors.length && uni) {
      await supabase.from('university_majors').insert(
        majors.map((m: any, i: number) => ({ university_id: uni.id, name: m.name, language: m.language, tuition: m.tuition || null, currency: m.currency || 'USD', sort_order: i }))
      )
    }
    return null
  }

  if (type === 'student_result') {
    const { error } = await supabase.from('student_results').insert({
      ...data, photo_urls: photoUrls, created_at: now,
    })
    return error?.message || null
  }

  if (type === 'news') {
    const { error } = await supabase.from('news_posts').insert({
      ...data, photo_urls: photoUrls, created_at: now, updated_at: now,
      published_at: data.published ? now : null,
    })
    return error?.message || null
  }

  if (type === 'testimonial') {
    const { error } = await supabase.from('testimonials').insert({
      ...data, photo_urls: photoUrls, sort_order: 0, created_at: now, updated_at: now,
    })
    return error?.message || null
  }

  return 'Unknown type'
}

export default function AiAssistantPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ type: ContentType; confidence: string; data: any } | null>(null)
  const [editedData, setEditedData] = useState<any>(null)
  const [manualType, setManualType] = useState<ContentType | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [scholarships, setScholarships] = useState<any[]>([])
  const [universities, setUniversities] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('scholarships').select('id,title,country').order('title').then(({ data }) => { if (data) setScholarships(data) })
    supabase.from('universities').select('id,name,country').order('name').then(({ data }) => { if (data) setUniversities(data) })
  }, [])

  const activeType = manualType ?? result?.type ?? null

  function handleTypeChange(type: ContentType) {
    setManualType(type)
    if (result) {
      setResult({ ...result, type })
    }
    setPhotoUrls([])
  }

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)
    setPhotoUrls([])
    try {
      const res = await fetch('/api/admin/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Xatolik')
      setResult(json)
      setEditedData(json.data)
      setManualType(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!activeType || !editedData) return
    setSaving(true)
    setError(null)
    const dataWithPhotos = { ...editedData, photo_urls: photoUrls }
    const err = await saveToSupabase(activeType, dataWithPhotos)
    setSaving(false)
    if (err) { setError(err); return }
    setSaved(true)
    setText('')
    setResult(null)
    setEditedData(null)
    setManualType(null)
    setPhotoUrls([])
  }

  function handleReset() {
    setResult(null)
    setEditedData(null)
    setManualType(null)
    setError(null)
    setSaved(false)
    setPhotoUrls([])
  }

  const showForm = result !== null || manualType !== null

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">AI Yordamchi</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Matn joylashtiring — AI kerakli ma'lumotlarni ajratib oladi va tasdiqlash uchun ko'rsatadi.</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-400 text-sm font-medium flex items-center gap-2">
          <span>✓</span> Muvaffaqiyatli saqlandi!
          <button onClick={handleReset} className="ml-auto text-green-600 dark:text-green-400 hover:underline">Yangi qo'shish</button>
        </div>
      )}

      {!showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <textarea
            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            rows={10}
            placeholder="Bu yerga grant, universitet, talaba natijasi, yangilik yoki fikr haqida matn joylashtiring (har qanday tilda)..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleParse}
              disabled={loading || !text.trim()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> Tahlil qilinmoqda...</>
              ) : (
                <><span>✦</span> AI bilan tahlil qilish</>
              )}
            </button>
            {text && <button onClick={() => setText('')} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Tozalash</button>}
          </div>
        </div>
      )}

      {showForm && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            {/* Type selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tur</span>
                {result && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONFIDENCE_COLORS[result.confidence]}`}>
                    {result.confidence === 'high' ? 'Yuqori ishonch' : result.confidence === 'medium' ? "O'rtacha ishonch" : 'Past ishonch'}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(TYPE_LABELS) as ContentType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      activeType === type
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-teal-400'
                    }`}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeType ? TYPE_LABELS[activeType] : ''} ma'lumotlari
              </h2>
              <button onClick={handleReset} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">← Orqaga</button>
            </div>

            {activeType === 'scholarship' && <ScholarshipForm data={editedData || {}} onChange={setEditedData} />}
            {activeType === 'university' && <UniversityForm data={editedData || {}} onChange={setEditedData} />}
            {activeType === 'student_result' && <StudentResultForm data={editedData || {}} onChange={setEditedData} scholarships={scholarships} universities={universities} />}
            {activeType === 'news' && <NewsForm data={editedData || {}} onChange={setEditedData} />}
            {activeType === 'testimonial' && <TestimonialForm data={editedData || {}} onChange={setEditedData} scholarships={scholarships} universities={universities} />}

            {/* Photo upload */}
            {activeType && (
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <ImageUpload
                  bucket={BUCKET_MAP[activeType]}
                  urls={photoUrls}
                  onChange={setPhotoUrls}
                  multiple
                  label="Rasmlar"
                />
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving || !activeType}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Saqlanmoqda...' : '✓ Tasdiqlash va saqlash'}
              </button>
              <button onClick={handleReset} className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
