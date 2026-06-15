'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { University } from '@/lib/supabase/types'

const emptyForm = { name: '', country: '', city: '', website_url: '', tuition_usd: '', type: 'public' as University['type'], ranking: '', programs: '' }
const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'

export default function UniversitiesPage() {
  const [items, setItems] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('universities').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message); else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditId(null); setForm(emptyForm); setError(null); setShowModal(true) }
  function openEdit(item: University) {
    setEditId(item.id)
    setForm({ name: item.name, country: item.country, city: item.city ?? '', website_url: item.website_url ?? '', tuition_usd: item.tuition_usd?.toString() ?? '', type: item.type, ranking: item.ranking?.toString() ?? '', programs: item.programs?.join(', ') ?? '' })
    setError(null); setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const payload = { name: form.name, country: form.country, city: form.city || null, website_url: form.website_url || null, tuition_usd: form.tuition_usd ? Number(form.tuition_usd) : null, type: form.type, ranking: form.ranking ? Number(form.ranking) : null, programs: form.programs ? form.programs.split(',').map(s => s.trim()).filter(Boolean) : [] }
    const supabase = createClient()
    const res = editId ? await supabase.from('universities').update(payload).eq('id', editId) : await supabase.from('universities').insert(payload)
    if (res.error) { setError(res.error.message) } else { setShowModal(false); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('universities').delete().eq('id', id)
    if (error) setError(error.message); else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Universitetlar</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Qo'shish</button>
      </div>
      {error && <div className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      {loading ? <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Davlat</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Shahar</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Narx</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Turi</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.country}</td>
                  <td className="px-4 py-3 text-gray-600">{item.city ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.tuition_usd != null ? `$${item.tuition_usd.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'public' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{item.type === 'public' ? 'Davlat' : 'Xususiy'}</span></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-teal-700 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50">Tahrir</button>
                    <button onClick={() => del(item.id)} className="text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50">O'chir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Ma'lumot yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{editId ? 'Universitetni tahrirlash' : 'Yangi universitet'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3">
              {error && <div className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Nomi *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Davlat *</label><input required value={form.country} onChange={e => setForm({...form, country: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Shahar</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Veb-sayt</label><input type="url" value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">To'lov (USD)</label><input type="number" min={0} value={form.tuition_usd} onChange={e => setForm({...form, tuition_usd: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Turi</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as University['type']})} className={inp}>
                  <option value="public">Davlat</option>
                  <option value="private">Xususiy</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Reyting</label><input type="number" min={1} value={form.ranking} onChange={e => setForm({...form, ranking: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Dasturlar (vergul bilan)</label><input value={form.programs} onChange={e => setForm({...form, programs: e.target.value})} placeholder="IT, Biznes, Tibbiyot" className={inp} /></div>
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
