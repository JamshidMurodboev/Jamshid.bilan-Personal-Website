'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ContentType = 'scholarship' | 'university' | 'student_result' | 'news' | 'testimonial'

const TYPE_LABELS: Record<ContentType, string> = {
  scholarship: 'Grant',
  university: 'Universitet',
  student_result: 'Talaba natijasi',
  news: 'Yangilik',
  testimonial: 'Talaba fikri',
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500'
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {multiline
        ? <textarea className={cls} rows={3} value={value} onChange={e => onChange(e.target.value)} />
        : <input className={cls} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <select
        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
      <div className="md:col-span-2"><Field label="Tavsif (UZ)" value={data.description_uz || ''} onChange={v => set('description_uz', v)} multiline /></div>
      <div className="md:col-span-2"><Field label="Tavsif (RU)" value={data.description_ru || ''} onChange={v => set('description_ru', v)} multiline /></div>
      <div className="md:col-span-2"><Field label="Tavsif (EN)" value={data.description_en || ''} onChange={v => set('description_en', v)} multiline /></div>
    </div>
  )
}

function UniversityForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
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
      {data.majors?.length > 0 && (
        <div className="md:col-span-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Mutaxassisliklar</div>
          <div className="space-y-2">
            {data.majors.map((m: any, i: number) => (
              <div key={i} className="grid grid-cols-4 gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input className="col-span-2 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" placeholder="Nomi" value={m.name || ''} onChange={e => { const ms = [...data.majors]; ms[i] = { ...ms[i], name: e.target.value }; set('majors', ms) }} />
                <input className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" placeholder="Til" value={m.language || ''} onChange={e => { const ms = [...data.majors]; ms[i] = { ...ms[i], language: e.target.value }; set('majors', ms) }} />
                <input className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" placeholder="Narx" value={m.tuition || ''} onChange={e => { const ms = [...data.majors]; ms[i] = { ...ms[i], tuition: e.target.value }; set('majors', ms) }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StudentResultForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Talaba ismi" value={data.student_name || ''} onChange={v => set('student_name', v)} />
      <Field label="Davlat" value={data.country || ''} onChange={v => set('country', v)} />
      <Field label="Universitet nomi" value={data.university_name || ''} onChange={v => set('university_name', v)} />
      <Field label="Mutaxassislik" value={data.major || ''} onChange={v => set('major', v)} />
      <Field label="Til" value={data.language || ''} onChange={v => set('language', v)} />
      <Field label="Yil" value={data.year?.toString() || ''} onChange={v => set('year', v ? parseInt(v) : null)} />
      <Field label="Universitet reytingi" value={data.university_ranking?.toString() || ''} onChange={v => set('university_ranking', v ? parseInt(v) : null)} />
      <SelectField label="Daraja" value={data.degree_level || 'bachelor'} onChange={v => set('degree_level', v)}
        options={[{ value: 'bachelor', label: 'Bakalavr' }, { value: 'master', label: 'Magistr' }, { value: 'phd', label: 'PhD' }]} />
      <SelectField label="Kategoriya" value={data.category || 'scholarship_winner'} onChange={v => set('category', v)}
        options={[{ value: 'scholarship_winner', label: 'Grant g\'olibi' }, { value: 'tuition_based', label: 'Kontrakt' }]} />
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
      <Field label="Matn (UZ)" value={data.body_uz || ''} onChange={v => set('body_uz', v)} multiline />
      <Field label="Matn (RU)" value={data.body_ru || ''} onChange={v => set('body_ru', v)} multiline />
      <Field label="Matn (EN)" value={data.body_en || ''} onChange={v => set('body_en', v)} multiline />
    </div>
  )
}

function TestimonialForm({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const set = (key: string, val: any) => onChange({ ...data, [key]: val })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Talaba ismi" value={data.student_name || ''} onChange={v => set('student_name', v)} />
      <SelectField label="Kategoriya" value={data.category || 'scholarship_winner'} onChange={v => set('category', v)}
        options={[{ value: 'scholarship_winner', label: 'Grant g\'olibi' }, { value: 'tuition_based', label: 'Kontrakt' }]} />
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

  if (type === 'scholarship') {
    const { error } = await supabase.from('scholarships').insert({
      ...data,
      coverage: data.coverage || [],
      photo_urls: [],
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
      programs: [], photo_urls: [], created_at: now, updated_at: now,
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
      ...data, photo_urls: [], created_at: now,
    })
    return error?.message || null
  }

  if (type === 'news') {
    const { error } = await supabase.from('news_posts').insert({
      ...data, photo_urls: [], created_at: now, updated_at: now,
      published_at: data.published ? now : null,
    })
    return error?.message || null
  }

  if (type === 'testimonial') {
    const { error } = await supabase.from('testimonials').insert({
      ...data, photo_urls: [], sort_order: 0, created_at: now, updated_at: now,
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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleParse() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)
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
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result || !editedData) return
    setSaving(true)
    setError(null)
    const err = await saveToSupabase(result.type, editedData)
    setSaving(false)
    if (err) { setError(err); return }
    setSaved(true)
    setText('')
    setResult(null)
    setEditedData(null)
  }

  function handleReset() {
    setResult(null)
    setEditedData(null)
    setError(null)
    setSaved(false)
  }

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

      {!result && (
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

      {result && editedData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {TYPE_LABELS[result.type]} ma'lumotlari
                </h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONFIDENCE_COLORS[result.confidence]}`}>
                  {result.confidence === 'high' ? 'Yuqori ishonch' : result.confidence === 'medium' ? "O'rtacha ishonch" : 'Past ishonch'}
                </span>
              </div>
              <button onClick={handleReset} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">← Orqaga</button>
            </div>

            {result.type === 'scholarship' && <ScholarshipForm data={editedData} onChange={setEditedData} />}
            {result.type === 'university' && <UniversityForm data={editedData} onChange={setEditedData} />}
            {result.type === 'student_result' && <StudentResultForm data={editedData} onChange={setEditedData} />}
            {result.type === 'news' && <NewsForm data={editedData} onChange={setEditedData} />}
            {result.type === 'testimonial' && <TestimonialForm data={editedData} onChange={setEditedData} />}

            {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
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
