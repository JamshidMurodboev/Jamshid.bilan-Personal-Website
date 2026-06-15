'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StudentResult } from '@/lib/supabase/types'

const emptyForm = { student_name: '', photo_url: '', degree_level: 'bachelor' as StudentResult['degree_level'], year: new Date().getFullYear().toString(), country: '', testimonial: '' }
const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
const degreeLabels: Record<StudentResult['degree_level'], string> = { bachelor: 'Bakalavr', master: 'Magistr', phd: 'PhD' }

export default function ResultsPage() {
  const [items, setItems] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('student_results').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message); else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditId(null); setForm(emptyForm); setError(null); setShowModal(true) }
  function openEdit(item: StudentResult) {
    setEditId(item.id)
    setForm({ student_name: item.student_name, photo_url: item.photo_url ?? '', degree_level: item.degree_level, year: item.year.toString(), country: item.country, testimonial: item.testimonial ?? '' })
    setError(null); setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const payload = { student_name: form.student_name, photo_url: form.photo_url || null, degree_level: form.degree_level, year: Number(form.year), country: form.country, testimonial: form.testimonial || null }
    const supabase = createClient()
    const res = editId ? await supabase.from('student_results').update(payload).eq('id', editId) : await supabase.from('student_results').insert(payload)
    if (res.error) { setError(res.error.message) } else { setShowModal(false); load() }
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('student_results').delete().eq('id', id)
    if (error) setError(error.message); else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Talaba natijalari</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Qo'shish</button>
      </div>
      {error && <div className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      {loading ? <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Talaba ismi</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Daraja</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Yil</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Davlat</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.student_name}</td>
                  <td className="px-4 py-3 text-gray-600">{degreeLabels[item.degree_level]}</td>
                  <td className="px-4 py-3 text-gray-600">{item.year}</td>
                  <td className="px-4 py-3 text-gray-600">{item.country}</td>
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
              <h2 className="text-lg font-semibold text-gray-800">{editId ? 'Natijani tahrirlash' : 'Yangi natija'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3">
              {error && <div className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Talaba ismi *</label><input required value={form.student_name} onChange={e => setForm({...form, student_name: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Rasm URL</label><input type="url" value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Daraja *</label>
                <select required value={form.degree_level} onChange={e => setForm({...form, degree_level: e.target.value as StudentResult['degree_level']})} className={inp}>
                  <option value="bachelor">Bakalavr</option>
                  <option value="master">Magistr</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Yil *</label><input required type="number" min={2000} max={2100} value={form.year} onChange={e => setForm({...form, year: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Davlat *</label><input required value={form.country} onChange={e => setForm({...form, country: e.target.value})} className={inp} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Sharh</label><textarea rows={4} value={form.testimonial} onChange={e => setForm({...form, testimonial: e.target.value})} className={inp} /></div>
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
