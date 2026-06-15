'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BlogPost } from '@/lib/supabase/types'

const emptyForm = { title_uz: '', slug: '', title_ru: '', title_en: '', excerpt_uz: '', body_uz: '', body_ru: '', body_en: '', cover_url: '', tags: '', published: false, published_at: '' }
const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'

export default function BlogPage() {
  const [items, setItems] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('blog_posts').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message); else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditId(null); setForm(emptyForm); setError(null); setShowModal(true) }
  function openEdit(item: BlogPost) {
    setEditId(item.id)
    setForm({ title_uz: item.title_uz, slug: item.slug, title_ru: item.title_ru ?? '', title_en: item.title_en ?? '', excerpt_uz: item.excerpt_uz ?? '', body_uz: item.body_uz, body_ru: item.body_ru ?? '', body_en: item.body_en ?? '', cover_url: item.cover_url ?? '', tags: item.tags?.join(', ') ?? '', published: item.published, published_at: item.published_at ? item.published_at.slice(0, 16) : '' })
    setError(null); setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const payload = { title_uz: form.title_uz, slug: form.slug, title_ru: form.title_ru || null, title_en: form.title_en || null, excerpt_uz: form.excerpt_uz || null, body_uz: form.body_uz, body_ru: form.body_ru || null, body_en: form.body_en || null, cover_url: form.cover_url || null, tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [], published: form.published, published_at: form.published_at || null }
    const supabase = createClient()
    const res = editId ? await supabase.from('blog_posts').update(payload).eq('id', editId) : await supabase.from('blog_posts').insert(payload)
    if (res.error) { setError(res.error.message) } else { setShowModal(false); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('blog_posts').delete().eq('id', id)
    if (error) setError(error.message); else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Qo'shish</button>
      </div>
      {error && <div className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      {loading ? <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Sarlavha</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.title_uz}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.slug}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{item.published ? 'Chop etilgan' : 'Qoralama'}</span></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-teal-700 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50">Tahrir</button>
                    <button onClick={() => del(item.id)} className="text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50">O'chir</button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{editId ? 'Postni tahrirlash' : 'Yangi post'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3">
              {error && <div className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Sarlavha (UZ) *</label><input required value={form.title_uz} onChange={e => setForm({...form, title_uz: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label><input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="my-blog-post" className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Sarlavha (RU)</label><input value={form.title_ru} onChange={e => setForm({...form, title_ru: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Sarlavha (EN)</label><input value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Qisqacha (UZ)</label><textarea rows={2} value={form.excerpt_uz} onChange={e => setForm({...form, excerpt_uz: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Matn (UZ) *</label><textarea required rows={5} value={form.body_uz} onChange={e => setForm({...form, body_uz: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Matn (RU)</label><textarea rows={4} value={form.body_ru} onChange={e => setForm({...form, body_ru: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Matn (EN)</label><textarea rows={4} value={form.body_en} onChange={e => setForm({...form, body_en: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Muqova URL</label><input type="url" value={form.cover_url} onChange={e => setForm({...form, cover_url: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Teglar (vergul bilan)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="grant, ta'lim, xorijda" className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Chop etish sanasi</label><input type="datetime-local" value={form.published_at} onChange={e => setForm({...form, published_at: e.target.value})} className={inp} /></div>
              <div className="flex items-center gap-2"><input id="blog-pub" type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4 accent-teal-700" /><label htmlFor="blog-pub" className="text-sm font-medium text-gray-700">Chop etilgan</label></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50">Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
