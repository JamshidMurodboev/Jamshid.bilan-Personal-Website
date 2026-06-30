'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NewsPost } from '@/lib/supabase/types'
import ImageUpload from '@/components/admin/ImageUpload'
import { autoTranslate } from '@/lib/translate'

const emptyForm = {
  title_uz: '',
  title_ru: '',
  title_en: '',
  body_uz: '',
  body_ru: '',
  body_en: '',
  photo_urls: [] as string[],
  cover_url: '',
  published: false,
  published_at: '',
}

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

export default function NewsPage() {
  const [items, setItems] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [translatingTitle, setTranslatingTitle] = useState(false)
  const [translatingBody, setTranslatingBody] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient()
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false })
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

  function openEdit(item: NewsPost) {
    setEditId(item.id)
    setForm({
      title_uz: item.title_uz,
      title_ru: item.title_ru ?? '',
      title_en: item.title_en ?? '',
      body_uz: item.body_uz,
      body_ru: item.body_ru ?? '',
      body_en: item.body_en ?? '',
      photo_urls: item.photo_urls ?? [],
      cover_url: item.cover_url ?? '',
      published: item.published,
      published_at: item.published_at ? item.published_at.slice(0, 16) : '',
    })
    setError(null)
    setShowModal(true)
  }

  async function handleTranslateTitle() {
    if (!form.title_uz.trim()) return
    setTranslatingTitle(true)
    try {
      const result = await autoTranslate(form.title_uz)
      setForm(f => ({
        ...f,
        title_ru: f.title_ru || result.ru,
        title_en: f.title_en || result.en,
      }))
    } finally {
      setTranslatingTitle(false)
    }
  }

  async function handleTranslateBody() {
    if (!form.body_uz.trim()) return
    setTranslatingBody(true)
    try {
      const result = await autoTranslate(form.body_uz)
      setForm(f => ({
        ...f,
        body_ru: f.body_ru || result.ru,
        body_en: f.body_en || result.en,
      }))
    } finally {
      setTranslatingBody(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      title_uz: form.title_uz,
      title_ru: form.title_ru || null,
      title_en: form.title_en || null,
      body_uz: form.body_uz,
      body_ru: form.body_ru || null,
      body_en: form.body_en || null,
      photo_urls: form.photo_urls.length > 0 ? form.photo_urls : null,
      cover_url: form.cover_url || null,
      published: form.published,
      published_at: form.published_at || null,
    }
    const supabase = createClient()
    const res = editId
      ? await supabase.from('news_posts').update(payload).eq('id', editId)
      : await supabase.from('news_posts').insert(payload)
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
    const { error } = await createClient().from('news_posts').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Yangiliklar</h1>
        <button
          onClick={openCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Qo&apos;shish
        </button>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-teal-700 dark:text-teal-400 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Sarlavha</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{item.title_uz}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {item.published ? 'Chop etilgan' : 'Qoralama'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString('uz-UZ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-teal-700 dark:text-teal-400 text-xs font-medium px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-900/30"
                    >
                      Tahrir
                    </button>
                    <button
                      onClick={() => del(item.id)}
                      className="text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      O&apos;chir
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                    Ma&apos;lumot yo&apos;q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editId ? 'Yangilikni tahrirlash' : 'Yangi yangilik'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Title UZ with autoTranslate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Sarlavha (UZ) *</label>
                  <button
                    type="button"
                    onClick={handleTranslateTitle}
                    disabled={translatingTitle || !form.title_uz.trim()}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {translatingTitle ? 'Tarjimon...' : 'Avtotarjima'}
                  </button>
                </div>
                <input
                  required
                  value={form.title_uz}
                  onChange={e => setForm({ ...form, title_uz: e.target.value })}
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sarlavha (RU)</label>
                <input
                  value={form.title_ru}
                  onChange={e => setForm({ ...form, title_ru: e.target.value })}
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sarlavha (EN)</label>
                <input
                  value={form.title_en}
                  onChange={e => setForm({ ...form, title_en: e.target.value })}
                  className={inp}
                />
              </div>

              {/* Body UZ with autoTranslate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Matn (UZ) *</label>
                  <button
                    type="button"
                    onClick={handleTranslateBody}
                    disabled={translatingBody || !form.body_uz.trim()}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {translatingBody ? 'Tarjimon...' : 'Avtotarjima'}
                  </button>
                </div>
                <textarea
                  required
                  rows={5}
                  value={form.body_uz}
                  onChange={e => setForm({ ...form, body_uz: e.target.value })}
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Matn (RU)</label>
                <textarea
                  rows={4}
                  value={form.body_ru}
                  onChange={e => setForm({ ...form, body_ru: e.target.value })}
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Matn (EN)</label>
                <textarea
                  rows={4}
                  value={form.body_en}
                  onChange={e => setForm({ ...form, body_en: e.target.value })}
                  className={inp}
                />
              </div>

              {/* Photo URLs via ImageUpload */}
              <div>
                <ImageUpload
                  bucket="news"
                  urls={form.photo_urls}
                  onChange={urls => setForm(f => ({ ...f, photo_urls: urls }))}
                  multiple
                  label="Rasmlar"
                />
              </div>

              {/* Cover URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Muqova URL</label>
                <input
                  type="url"
                  value={form.cover_url}
                  onChange={e => setForm({ ...form, cover_url: e.target.value })}
                  className={inp}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chop etish sanasi</label>
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={e => setForm({ ...form, published_at: e.target.value })}
                  className={inp}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="news-pub"
                  type="checkbox"
                  checked={form.published}
                  onChange={e => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 accent-teal-700"
                />
                <label htmlFor="news-pub" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chop etilgan
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
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
