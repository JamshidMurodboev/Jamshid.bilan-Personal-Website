'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Scholarship } from '@/lib/supabase/types'

const emptyForm = { title: '', country: '', university: '', coverage: '', eligibility: '', deadline: '', difficulty: '', tip: '', application_url: '', status: 'open' as Scholarship['status'] }
const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'

function StatusBadge({ status }: { status: Scholarship['status'] }) {
  const cfg = { open: 'bg-green-100 text-green-700', closed: 'bg-red-100 text-red-700', upcoming: 'bg-yellow-100 text-yellow-700' }
  const lbl = { open: 'Ochiq', closed: 'Yopiq', upcoming: 'Kelayotgan' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg[status]}`}>{lbl[status]}</span>
}

export default function ScholarshipsPage() {
  const [items, setItems] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('scholarships').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditId(null); setForm(emptyForm); setError(null); setShowModal(true) }
  function openEdit(item: Scholarship) {
    setEditId(item.id)
    setForm({ title: item.title, country: item.country, university: item.university ?? '', coverage: item.coverage?.join(', ') ?? '', eligibility: item.eligibility ?? '', deadline: item.deadline ?? '', difficulty: item.difficulty?.toString() ?? '', tip: item.tip ?? '', application_url: item.application_url ?? '', status: item.status })
    setError(null); setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const payload = { title: form.title, country: form.country, university: form.university || null, coverage: form.coverage ? form.coverage.split(',').map(s => s.trim()).filter(Boolean) : [], eligibility: form.eligibility || null, deadline: form.deadline || null, difficulty: form.difficulty ? Number(form.difficulty) : null, tip: form.tip || null, application_url: form.application_url || null, status: form.status }
    const supabase = createClient()
    const res = editId ? await supabase.from('scholarships').update(payload).eq('id', editId) : await supabase.from('scholarships').insert(payload)
    if (res.error) { setError(res.error.message) } else { setShowModal(false); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('scholarships').delete().eq('id', id)
    if (error) setError(error.message); else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Grantlar</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">+ Qo'shish</button>
      </div>
      {error && <div className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      {loading ? <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Davlat</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Muddat</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                  <td className="px-4 py-3 text-gray-600">{item.country}</td>
                  <td className="px-4 py-3 text-gray-600">{item.deadline ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-teal-700 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50">Tahrir</button>
                    <button onClick={() => del(item.id)} className="text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50">O'chir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Ma'lumot yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{editId ? 'Grantni tahrirlash' : 'Yangi grant'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3">
              {error && <div className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Nomi *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Davlat *</label><input required value={form.country} onChange={e => setForm({...form, country: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Universitet</label><input value={form.university} onChange={e => setForm({...form, university: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Qamrov (vergul bilan)</label><input value={form.coverage} onChange={e => setForm({...form, coverage: e.target.value})} placeholder="Turar joy, Ovqat, Stipendiya" className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Talablar</label><textarea rows={2} value={form.eligibility} onChange={e => setForm({...form, eligibility: e.target.value})} className={inp} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Muddat</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={inp} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Qiyinlik (1-5)</label><input type="number" min={1} max={5} value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className={inp} /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Maslahat</label><textarea rows={2} value={form.tip} onChange={e => setForm({...form, tip: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Ariza URL</label><input type="url" value={form.application_url} onChange={e => setForm({...form, application_url: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value as Scholarship['status']})} className={inp}>
                  <option value="open">Ochiq</option>
                  <option value="closed">Yopiq</option>
                  <option value="upcoming">Kelayotgan</option>
                </select>
              </div>
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
