'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Faq } from '@/lib/supabase/types'

const emptyForm = { question_uz: '', question_ru: '', question_en: '', answer_uz: '', answer_ru: '', answer_en: '' }
const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'

export default function FaqAdminPage() {
  const [items, setItems] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('faqs').select('*').order('sort_order', { ascending: true })
    if (error) setError(error.message); else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditId(null); setForm(emptyForm); setError(null); setShowModal(true) }
  function openEdit(item: Faq) {
    setEditId(item.id)
    setForm({
      question_uz: item.question_uz, question_ru: item.question_ru ?? '', question_en: item.question_en ?? '',
      answer_uz: item.answer_uz, answer_ru: item.answer_ru ?? '', answer_en: item.answer_en ?? '',
    })
    setError(null); setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const payload = {
      question_uz: form.question_uz, question_ru: form.question_ru || null, question_en: form.question_en || null,
      answer_uz: form.answer_uz, answer_ru: form.answer_ru || null, answer_en: form.answer_en || null,
    }
    const supabase = createClient()
    const res = editId
      ? await supabase.from('faqs').update(payload).eq('id', editId)
      : await supabase.from('faqs').insert({ ...payload, sort_order: items.length })
    if (res.error) { setError(res.error.message) } else { setShowModal(false); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('faqs').delete().eq('id', id)
    if (error) setError(error.message); else load()
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const a = items[index], b = items[target]
    const supabase = createClient()
    await Promise.all([
      supabase.from('faqs').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('faqs').update({ sort_order: a.sort_order }).eq('id', b.id),
    ])
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ko'p so'raladigan savollar</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Qo'shish</button>
      </div>
      {error && <div className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>}
      {loading ? <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div> : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Savol</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Javob</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-2 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-teal-700 disabled:opacity-30 text-xs leading-none">▲</button>
                      <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-gray-400 hover:text-teal-700 disabled:opacity-30 text-xs leading-none">▼</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 max-w-xs">{item.question_uz}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-sm truncate">{item.answer_uz}</td>
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{editId ? 'Savolni tahrirlash' : "Yangi savol"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3">
              {error && <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>}
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Savol (UZ) *</label><input required value={form.question_uz} onChange={e => setForm({...form, question_uz: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Savol (RU)</label><input value={form.question_ru} onChange={e => setForm({...form, question_ru: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Savol (EN)</label><input value={form.question_en} onChange={e => setForm({...form, question_en: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Javob (UZ) *</label><textarea required rows={3} value={form.answer_uz} onChange={e => setForm({...form, answer_uz: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Javob (RU)</label><textarea rows={2} value={form.answer_ru} onChange={e => setForm({...form, answer_ru: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Javob (EN)</label><textarea rows={2} value={form.answer_en} onChange={e => setForm({...form, answer_en: e.target.value})} className={inp} /></div>
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
