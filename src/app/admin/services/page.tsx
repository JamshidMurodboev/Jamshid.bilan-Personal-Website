'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/lib/supabase/types'
import ImageUpload from '@/components/admin/ImageUpload'
import { autoTranslate } from '@/lib/translate'
import { slugify } from '@/lib/slugify'

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

type FormState = {
  name_uz: string
  name_ru: string
  name_en: string
  description_uz: string
  description_ru: string
  description_en: string
  photo_url: string
  price: string
  currency: Service['currency'] | ''
  currency_custom: string
  status: 'active' | 'inactive'
  home_order: string
  slug: string
}

const emptyForm: FormState = {
  name_uz: '',
  name_ru: '',
  name_en: '',
  description_uz: '',
  description_ru: '',
  description_en: '',
  photo_url: '',
  price: '',
  currency: '',
  currency_custom: '',
  status: 'active',
  home_order: '',
  slug: '',
}

function formatPrice(price?: number, currency?: string, custom?: string) {
  if (!price && currency !== 'FREE') return '—'
  if (currency === 'FREE') return 'Bepul'
  return `${(price ?? 0).toLocaleString()} ${currency === 'OTHER' ? custom || '' : currency}`
}

export default function ServicesAdminPage() {
  const [items, setItems] = useState<Service[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [translatingName, setTranslatingName] = useState(false)
  const [translatingDesc, setTranslatingDesc] = useState(false)
  const [allScholarships, setAllScholarships] = useState<{id: string; title: string}[]>([])
  const [allUniversities, setAllUniversities] = useState<{id: string; name: string}[]>([])
  const [allResults, setAllResults] = useState<{id: string; student_name: string; category: string}[]>([])
  const [selectedScholarships, setSelectedScholarships] = useState<string[]>([])
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  const [orderPending, setOrderPending] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('services').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const sb = createClient()
    sb.from('scholarships').select('id,title').order('title').then(({ data }) => setAllScholarships(data ?? []))
    sb.from('universities').select('id,name').order('name').then(({ data }) => setAllUniversities(data ?? []))
    sb.from('student_results').select('id,student_name,category').order('student_name').then(({ data }) => setAllResults(data ?? []))
  }, [])

  function handleDragStart(index: number) { setDragIndex(index) }
  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const newItems = [...items]
    const [moved] = newItems.splice(dragIndex, 1)
    newItems.splice(index, 0, moved)
    setItems(newItems)
    setDragIndex(index)
    setOrderPending(true)
  }
  function handleDrop() {
    setDragIndex(null)
  }
  async function handleSaveOrder() {
    const sb = createClient()
    for (let i = 0; i < items.length; i++) {
      await sb.from('services').update({ home_order: i + 1 }).eq('id', items[i].id)
    }
    setOrderPending(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const sb = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}.${ext}`
      const { data, error } = await sb.storage
        .from('services')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })
      if (error) {
        console.error('Upload error:', error)
        alert('Upload failed: ' + error.message)
        return
      }
      const { data: urlData } = sb.storage.from('services').getPublicUrl(fileName)
      setForm(f => ({ ...f, photo_url: urlData.publicUrl }))
    } catch (err) {
      console.error('Upload exception:', err)
      alert('Upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setSelectedScholarships([])
    setSelectedUniversities([])
    setSelectedResults([])
    setError(null)
    setShowModal(true)
  }

  async function openEdit(item: Service) {
    setEditId(item.id)
    setForm({
      name_uz: item.name_uz,
      name_ru: item.name_ru ?? '',
      name_en: item.name_en ?? '',
      description_uz: item.description_uz ?? '',
      description_ru: item.description_ru ?? '',
      description_en: item.description_en ?? '',
      photo_url: item.photo_url ?? '',
      price: item.price?.toString() ?? '',
      currency: item.currency ?? '',
      currency_custom: item.currency_custom ?? '',
      status: item.status ?? 'active',
      home_order: item.home_order?.toString() ?? '',
      slug: item.slug ?? slugify(item.name_uz),
    })
    setError(null)
    setShowModal(true)
    // Load existing connections
    const sb = createClient()
    const [schRes, uniRes, resRes] = await Promise.all([
      sb.from('service_scholarships').select('scholarship_id').eq('service_id', item.id),
      sb.from('service_universities').select('university_id').eq('service_id', item.id),
      sb.from('service_results').select('result_id').eq('service_id', item.id),
    ])
    setSelectedScholarships((schRes.data ?? []).map((r: any) => r.scholarship_id))
    setSelectedUniversities((uniRes.data ?? []).map((r: any) => r.university_id))
    setSelectedResults((resRes.data ?? []).map((r: any) => r.result_id))
  }

  async function handleTranslateName() {
    if (!form.name_uz.trim()) return
    setTranslatingName(true)
    try {
      const result = await autoTranslate(form.name_uz)
      setForm(f => ({ ...f, name_ru: result.ru || f.name_ru, name_en: result.en || f.name_en }))
    } finally {
      setTranslatingName(false)
    }
  }

  async function handleTranslateDesc() {
    if (!form.description_uz.trim()) return
    setTranslatingDesc(true)
    try {
      const result = await autoTranslate(form.description_uz)
      setForm(f => ({ ...f, description_ru: result.ru || f.description_ru, description_en: result.en || f.description_en }))
    } finally {
      setTranslatingDesc(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload: Record<string, unknown> = {
      name_uz: form.name_uz,
      name_ru: form.name_ru || null,
      name_en: form.name_en || null,
      description_uz: form.description_uz || null,
      description_ru: form.description_ru || null,
      description_en: form.description_en || null,
      photo_url: form.photo_url || null,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency || null,
      currency_custom: form.currency === 'OTHER' ? form.currency_custom || null : null,
      status: form.status,
      home_order: form.home_order ? parseInt(form.home_order) : null,
      slug: form.slug || slugify(form.name_uz) || null,
    }

    const sb = createClient()
    let serviceId = editId
    if (editId) {
      const res = await sb.from('services').update(payload).eq('id', editId)
      if (res.error) { setError(res.error.message); setSaving(false); return }
    } else {
      const res = await sb.from('services').insert(payload).select('id').single()
      if (res.error || !res.data) { setError(res.error?.message ?? 'Insert failed'); setSaving(false); return }
      serviceId = res.data.id
    }

    // Save connections
    if (serviceId) {
      await sb.from('service_scholarships').delete().eq('service_id', serviceId)
      await sb.from('service_universities').delete().eq('service_id', serviceId)
      await sb.from('service_results').delete().eq('service_id', serviceId)
      if (selectedScholarships.length > 0) {
        await sb.from('service_scholarships').insert(selectedScholarships.map(sid => ({ service_id: serviceId, scholarship_id: sid })))
      }
      if (selectedUniversities.length > 0) {
        await sb.from('service_universities').insert(selectedUniversities.map(uid => ({ service_id: serviceId, university_id: uid })))
      }
      if (selectedResults.length > 0) {
        await sb.from('service_results').insert(selectedResults.map(rid => ({ service_id: serviceId, result_id: rid })))
      }
    }

    setShowModal(false)
    load()
    setSaving(false)
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('services').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Xizmatlar</h1>
        <button onClick={openCreate} className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Qo&apos;shish
        </button>
      </div>

      {error && !showModal && (
        <div className="text-red-600 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>
      )}

      {loading ? (
        <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Narx</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  className={`border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${dragIndex === index ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-400 cursor-grab select-none">⠣</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.name_uz}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatPrice(item.price, item.currency, item.currency_custom)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {item.status === 'active' ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleDateString('uz') : '—'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-teal-700 dark:text-teal-400 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20">Tahrir</button>
                    <button onClick={() => del(item.id)} className="text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">O&apos;chir</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Ma&apos;lumot yo&apos;q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {orderPending && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-white dark:bg-gray-900 border border-teal-200 dark:border-teal-700 shadow-xl rounded-2xl px-4 py-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">Tartib o&apos;zgardi</span>
          <button onClick={handleSaveOrder} className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition">
            Saqlash
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{editId ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>}

              {/* Name fields */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nomi (UZ) *</label>
                  <button type="button" onClick={handleTranslateName} disabled={translatingName || !form.name_uz.trim()} className="text-xs text-teal-700 dark:text-teal-400 hover:underline disabled:opacity-40">
                    {translatingName ? 'Tarjimon...' : 'RU/EN ga tarjima'}
                  </button>
                </div>
                <input required value={form.name_uz} onChange={e => setForm({ ...form, name_uz: e.target.value, slug: form.slug || slugify(e.target.value) })} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nomi (RU)</label>
                <input value={form.name_ru} onChange={e => setForm({ ...form, name_ru: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nomi (EN)</label>
                <input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} className={inp} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL Slug</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inp} placeholder="xizmat-nomi" />
              </div>

              {/* Description fields */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tavsif (UZ)</label>
                  <button type="button" onClick={handleTranslateDesc} disabled={translatingDesc || !form.description_uz.trim()} className="text-xs text-teal-700 dark:text-teal-400 hover:underline disabled:opacity-40">
                    {translatingDesc ? 'Tarjimon...' : 'RU/EN ga tarjima'}
                  </button>
                </div>
                <textarea rows={3} value={form.description_uz} onChange={e => setForm({ ...form, description_uz: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tavsif (RU)</label>
                <textarea rows={3} value={form.description_ru} onChange={e => setForm({ ...form, description_ru: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tavsif (EN)</label>
                <textarea rows={3} value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} className={inp} />
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rasm</label>
                {form.photo_url && (
                  <div className="mb-2 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, photo_url: '' }))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-teal-500 hover:text-teal-600 cursor-pointer transition-colors w-fit">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {uploadingPhoto ? 'Yuklanmoqda...' : 'Rasm yuklash'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                </label>
              </div>

              {/* Scholarship connections */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bog&apos;langan grantlar</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1">
                  {allScholarships.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedScholarships.includes(s.id)}
                        onChange={e => setSelectedScholarships(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{s.title}</span>
                    </label>
                  ))}
                  {allScholarships.length === 0 && <p className="text-xs text-gray-400">Grant yo&apos;q</p>}
                </div>
              </div>

              {/* Results connections */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Bog&apos;liq natijalar</label>
                <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                  {allResults.map(r => (
                    <label key={r.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded">
                      <input type="checkbox" checked={selectedResults.includes(r.id)} onChange={e => setSelectedResults(prev => e.target.checked ? [...prev, r.id] : prev.filter(id => id !== r.id))} />
                      <span className="text-sm text-gray-800 dark:text-gray-200">{r.student_name}</span>
                    </label>
                  ))}
                  {allResults.length === 0 && <p className="text-xs text-gray-400">Natija yo&apos;q</p>}
                </div>
              </div>

              {/* University connections */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bog&apos;langan universitetlar</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1">
                  {allUniversities.map(u => (
                    <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedUniversities.includes(u.id)}
                        onChange={e => setSelectedUniversities(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id))}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{u.name}</span>
                    </label>
                  ))}
                  {allUniversities.length === 0 && <p className="text-xs text-gray-400">Universitet yo&apos;q</p>}
                </div>
              </div>

              {/* Price + Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Narx</label>
                  <input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inp} placeholder="0" disabled={form.currency === 'FREE'} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Valyuta</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value as Service['currency'] | '' })} className={inp}>
                    <option value="">— Tanlang —</option>
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                    <option value="EUR">EUR</option>
                    <option value="TL">TL</option>
                    <option value="FREE">Bepul</option>
                    <option value="OTHER">Boshqa</option>
                  </select>
                </div>
              </div>
              {form.currency === 'OTHER' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Valyuta (maxsus)</label>
                  <input value={form.currency_custom} onChange={e => setForm({ ...form, currency_custom: e.target.value })} className={inp} placeholder="Masalan: SOм" />
                </div>
              )}

              {/* Status + home_order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })} className={inp}>
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bosh sahifa tartibi</label>
                  <input type="number" min={1} max={99} value={form.home_order} onChange={e => setForm({ ...form, home_order: e.target.value })} className={inp} placeholder="1, 2, 3..." />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60 transition-colors">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Bekor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
