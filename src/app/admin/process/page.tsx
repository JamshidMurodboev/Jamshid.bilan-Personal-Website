'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { autoTranslate } from '@/lib/translate'

interface ProcessStep {
  id: string
  number: string
  icon: string
  title_uz: string
  title_ru: string
  title_en: string
  desc_uz: string
  desc_ru: string
  desc_en: string
  color_key: string
  sort_order: number
}

const COLOR_OPTIONS = ['teal', 'purple', 'amber', 'sky', 'green', 'pink', 'orange', 'indigo']
const emptyForm = {
  number: '', icon: '📅',
  title_uz: '', title_ru: '', title_en: '',
  desc_uz: '', desc_ru: '', desc_en: '',
  color_key: 'teal', sort_order: 0,
}
const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'

export default function ProcessAdminPage() {
  const [items, setItems] = useState<ProcessStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<typeof emptyForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [translatingTitle, setTranslatingTitle] = useState(false)
  const [translatingDesc, setTranslatingDesc] = useState(false)
  const [sqlHint, setSqlHint] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient()
      .from('process_steps')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) {
      if (error.code === '42P01') setSqlHint(true)
      else setError(error.message)
    } else {
      setItems(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleTranslateTitle() {
    if (!form.title_uz.trim()) return
    setTranslatingTitle(true)
    try {
      const result = await autoTranslate(form.title_uz)
      setForm(f => ({ ...f, title_ru: result.ru || f.title_ru, title_en: result.en || f.title_en }))
    } finally { setTranslatingTitle(false) }
  }

  async function handleTranslateDesc() {
    if (!form.desc_uz.trim()) return
    setTranslatingDesc(true)
    try {
      const result = await autoTranslate(form.desc_uz)
      setForm(f => ({ ...f, desc_ru: result.ru || f.desc_ru, desc_en: result.en || f.desc_en }))
    } finally { setTranslatingDesc(false) }
  }

  function openCreate() {
    setEditId(null)
    setForm({ ...emptyForm, sort_order: items.length + 1, number: String(items.length + 1).padStart(2, '0') })
    setError(null); setShowModal(true)
  }
  function openEdit(item: ProcessStep) {
    setEditId(item.id)
    setForm({
      number: item.number, icon: item.icon,
      title_uz: item.title_uz ?? '', title_ru: item.title_ru ?? '', title_en: item.title_en ?? '',
      desc_uz: item.desc_uz ?? '', desc_ru: item.desc_ru ?? '', desc_en: item.desc_en ?? '',
      color_key: item.color_key ?? 'teal', sort_order: item.sort_order ?? 0,
    })
    setError(null); setShowModal(true)
  }

  async function handleSave() {
    if (!form.title_uz.trim()) { setError('Sarlavha (UZ) kiritilmagan'); return }
    setSaving(true); setError(null)
    const sb = createClient()
    const payload = { ...form }
    if (editId) {
      const { error } = await sb.from('process_steps').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await sb.from('process_steps').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }
    setSaving(false); setShowModal(false); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu qadamni o\'chirmoqchimisiz?')) return
    await createClient().from('process_steps').delete().eq('id', id)
    load()
  }

  const COLOR_PREVIEW: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-700', purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700', sky: 'bg-sky-100 text-sky-700',
    green: 'bg-green-100 text-green-700', pink: 'bg-pink-100 text-pink-700',
    orange: 'bg-orange-100 text-orange-700', indigo: 'bg-indigo-100 text-indigo-700',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jarayon Qadamlari</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          + Qo'shish
        </button>
      </div>

      {sqlHint && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-sm text-yellow-800 dark:text-yellow-300">
          <p className="font-semibold mb-2">Jadval yaratilmagan. Supabase SQL Editor'da quyidagini bajaring:</p>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded-lg border">{`CREATE TABLE process_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  number text NOT NULL,
  icon text NOT NULL DEFAULT '📅',
  title_uz text, title_ru text, title_en text,
  desc_uz text, desc_ru text, desc_en text,
  color_key text DEFAULT 'teal',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO process_steps (number,icon,title_uz,title_ru,title_en,desc_uz,desc_ru,desc_en,color_key,sort_order) VALUES
('01','📅','Murojaat qiling','Запишитесь','Book a session','Telegram orqali bog''laning va qulay vaqtni tanlang','Свяжитесь через Telegram и выберите удобное время','Reach out on Telegram and pick a convenient time','teal',1),
('02','📋','Profil ko''rib chiqish','Анализ профиля','Profile review','CV, attestat va til sertifikatingizni birga tahlil qilamiz','Вместе проанализируем ваше резюме, аттестат и языковые сертификаты','We''ll analyze your CV, transcripts, and language scores together','purple',2),
('03','🎯','Strategiya','Стратегия','Strategy','Shaxsiy yo''l xaritasi — qaysi grantlar, qachon va qanday','Личная дорожная карта — какие гранты, когда и как','Your personal roadmap — which scholarships, when, and how','amber',3),
('04','🚀','Ariza topshirish','Подача заявки','Application','SOP, motivatsion xat va intervyu tayyorgarligida yordam','Помощь с SOP, мотивационным письмом и подготовкой к интервью','Help with SOP, motivation letter, and interview preparation','sky',4);`}</pre>
          <button onClick={load} className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Qayta urinish</button>
        </div>
      )}

      {loading ? (
        <div className="text-teal-700 dark:text-teal-400 animate-pulse">Yuklanmoqda...</div>
      ) : items.length === 0 && !sqlHint ? (
        <p className="text-gray-500 dark:text-gray-400">Qadamlar yo'q. Birinchisini qo'shing.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${COLOR_PREVIEW[item.color_key] || 'bg-gray-100 text-gray-700'}`}>{item.number}</span>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-100 dark:hover:bg-teal-900 transition">Tahrirlash</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition">O'chirish</button>
                </div>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title_uz}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.desc_uz}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{editId ? 'Qadam tahrirlash' : 'Yangi qadam'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">×</button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Raqam</label>
                  <input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="01" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Emoji icon</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="📅" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Tartib</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className={inp} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Rang</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color_key: c }))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition border-2 ${COLOR_PREVIEW[c] || 'bg-gray-100 text-gray-700'} ${form.color_key === c ? 'border-gray-800 dark:border-white' : 'border-transparent'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Sarlavha</label>
                  <button onClick={handleTranslateTitle} disabled={translatingTitle || !form.title_uz.trim()}
                    className="text-xs px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 disabled:opacity-50 transition font-medium">
                    {translatingTitle ? 'Tarjima...' : '✦ Tarjima qil'}
                  </button>
                </div>
                <input value={form.title_uz} onChange={e => setForm(f => ({ ...f, title_uz: e.target.value }))} placeholder="O'zbekcha" className={inp} />
                <input value={form.title_ru} onChange={e => setForm(f => ({ ...f, title_ru: e.target.value }))} placeholder="Ruscha" className={inp} />
                <input value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} placeholder="Inglizcha" className={inp} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Tavsif</label>
                  <button onClick={handleTranslateDesc} disabled={translatingDesc || !form.desc_uz.trim()}
                    className="text-xs px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-100 disabled:opacity-50 transition font-medium">
                    {translatingDesc ? 'Tarjima...' : '✦ Tarjima qil'}
                  </button>
                </div>
                <textarea value={form.desc_uz} onChange={e => setForm(f => ({ ...f, desc_uz: e.target.value }))} placeholder="O'zbekcha" rows={2} className={`${inp} resize-none`} />
                <textarea value={form.desc_ru} onChange={e => setForm(f => ({ ...f, desc_ru: e.target.value }))} placeholder="Ruscha" rows={2} className={`${inp} resize-none`} />
                <textarea value={form.desc_en} onChange={e => setForm(f => ({ ...f, desc_en: e.target.value }))} placeholder="Inglizcha" rows={2} className={`${inp} resize-none`} />
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50">
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
