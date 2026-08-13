'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Resource {
  id: string
  title_uz: string
  title_ru: string | null
  title_en: string | null
  description_uz: string | null
  description_ru: string | null
  description_en: string | null
  file_url: string
  category: string
  created_at: string
}

const emptyForm = { title_uz: '', title_ru: '', title_en: '', description_uz: '', description_ru: '', description_en: '', file_url: '', category: 'general' }
const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'

export default function ResourcesAdminPage() {
  const [items, setItems] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('resources').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message); else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditId(null); setForm(emptyForm); setError(null); setShowModal(true) }
  function openEdit(item: Resource) {
    setEditId(item.id)
    setForm({
      title_uz: item.title_uz, title_ru: item.title_ru ?? '', title_en: item.title_en ?? '',
      description_uz: item.description_uz ?? '', description_ru: item.description_ru ?? '', description_en: item.description_en ?? '',
      file_url: item.file_url, category: item.category || 'general',
    })
    setError(null); setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const payload = {
      title_uz: form.title_uz, title_ru: form.title_ru || null, title_en: form.title_en || null,
      description_uz: form.description_uz || null, description_ru: form.description_ru || null, description_en: form.description_en || null,
      file_url: form.file_url, category: form.category || 'general',
    }
    const supabase = createClient()
    const res = editId
      ? await supabase.from('resources').update(payload).eq('id', editId)
      : await supabase.from('resources').insert(payload)
    if (res.error) { setError(res.error.message) } else { setShowModal(false); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('resources').delete().eq('id', id)
    if (error) setError(error.message); else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resurslar</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Qo'shish</button>
      </div>
      {error && <div className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>}
      {loading ? <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Sarlavha</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Kategoriya</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Fayl URL</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.title_uz}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.category}</td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500 max-w-xs truncate">{item.file_url}</td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(item)} className="text-teal-700 dark:text-teal-400 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20">Tahrir</button>
                    <button onClick={() => del(item.id)} className="text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">O'chir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Ma'lumot yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{editId ? 'Resursni tahrirlash' : 'Yangi resurs'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3">
              {error && <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Sarlavha *</label>
                <div className="flex items-center gap-1"><span className="text-xs text-gray-400 w-6">🇺🇿</span><input required value={form.title_uz} onChange={e => setForm({...form, title_uz: e.target.value})} className={`${inp} flex-1`} /></div>
                <div className="flex items-center gap-1"><span className="text-xs text-gray-400 w-6">🇷🇺</span><input value={form.title_ru} onChange={e => setForm({...form, title_ru: e.target.value})} className={`${inp} flex-1`} /></div>
                <div className="flex items-center gap-1"><span className="text-xs text-gray-400 w-6">🇬🇧</span><input value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} className={`${inp} flex-1`} /></div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tavsif</label>
                <div className="flex items-start gap-1"><span className="text-xs text-gray-400 w-6 pt-2">🇺🇿</span><textarea rows={2} value={form.description_uz} onChange={e => setForm({...form, description_uz: e.target.value})} className={`${inp} flex-1`} /></div>
                <div className="flex items-start gap-1"><span className="text-xs text-gray-400 w-6 pt-2">🇷🇺</span><textarea rows={2} value={form.description_ru} onChange={e => setForm({...form, description_ru: e.target.value})} className={`${inp} flex-1`} /></div>
                <div className="flex items-start gap-1"><span className="text-xs text-gray-400 w-6 pt-2">🇬🇧</span><textarea rows={2} value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} className={`${inp} flex-1`} /></div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Fayl URL *</label>
                <input required value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} className={inp} placeholder="https://..." />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Kategoriya</label>
                <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inp} placeholder="general" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
