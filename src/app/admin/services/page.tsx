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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [translatingName, setTranslatingName] = useState(false)
  const [translatingDesc, setTranslatingDesc] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('services').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
  }

  function openEdit(item: Service) {
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
    const res = editId
      ? await sb.from('services').update(payload).eq('id', editId)
      : await sb.from('services').insert(payload)

    if (res.error) {
      setError(res.error.message)
    } else {
      setShowModal(false)
      load()
    }
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
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Narx</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
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

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rasm URL</label>
                <input type="url" value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} className={inp} placeholder="https://..." />
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
