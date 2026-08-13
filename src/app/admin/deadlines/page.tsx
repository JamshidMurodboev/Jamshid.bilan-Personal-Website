'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Deadline {
  id: string
  title_uz: string
  title_ru: string | null
  title_en: string | null
  deadline_date: string
  link: string | null
  active: boolean
  created_at: string
}

const emptyForm = { title_uz: '', title_ru: '', title_en: '', deadline_date: '', link: '', active: true }
const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'

export default function DeadlinesAdminPage() {
  const [items, setItems] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('scholarship_deadlines').select('*').order('deadline_date', { ascending: true })
    if (error) setError(error.message); else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditId(null); setForm(emptyForm); setError(null); setShowModal(true) }
  function openEdit(item: Deadline) {
    setEditId(item.id)
    setForm({
      title_uz: item.title_uz,
      title_ru: item.title_ru ?? '',
      title_en: item.title_en ?? '',
      deadline_date: item.deadline_date,
      link: item.link ?? '',
      active: item.active,
    })
    setError(null); setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const payload = {
      title_uz: form.title_uz,
      title_ru: form.title_ru || null,
      title_en: form.title_en || null,
      deadline_date: form.deadline_date,
      link: form.link || null,
      active: form.active,
    }
    const supabase = createClient()
    const res = editId
      ? await supabase.from('scholarship_deadlines').update(payload).eq('id', editId)
      : await supabase.from('scholarship_deadlines').insert(payload)
    if (res.error) { setError(res.error.message) } else { setShowModal(false); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('scholarship_deadlines').delete().eq('id', id)
    if (error) setError(error.message); else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Muddatlar</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Qo'shish</button>
      </div>
      {error && <div className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>}
      {loading ? <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Sarlavha</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Muddat</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Holat</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.title_uz}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.deadline_date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                      {item.active ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
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
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{editId ? 'Muddatni tahrirlash' : 'Yangi muddat'}</h2>
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

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Muddat sanasi *</label>
                <input required type="date" value={form.deadline_date} onChange={e => setForm({...form, deadline_date: e.target.value})} className={inp} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Havola (URL)</label>
                <input type="url" value={form.link} onChange={e => setForm({...form, link: e.target.value})} className={inp} placeholder="https://..." />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="rounded" />
                <label htmlFor="active" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Faol</label>
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
