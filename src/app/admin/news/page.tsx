'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NewsPost } from '@/lib/supabase/types'
import ImageUpload from '@/components/admin/ImageUpload'
import { slugify } from '@/lib/slugify'
import TranslateFieldButton from '@/components/admin/TranslateFieldButton'
import MediaLinksAdmin from '@/components/admin/MediaLinksAdmin'
import type { MediaLink } from '@/lib/supabase/types'

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
  scholarship_id: '',
  university_id: '',
  slug: '',
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
  const [mediaLinks, setMediaLinks] = useState<MediaLink[]>([])
  const [scholarships, setScholarships] = useState<any[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [selectedScholarships, setSelectedScholarships] = useState<string[]>([])
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])

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

  useEffect(() => {
    load()
    const supabase = createClient()
    supabase.from('scholarships').select('id,title,country').order('title').then(({ data }) => setScholarships(data ?? []))
    supabase.from('universities').select('id,name,country').order('name').then(({ data }) => setUniversities(data ?? []))
  }, [])

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setMediaLinks([])
    setSelectedScholarships([])
    setSelectedUniversities([])
    setError(null)
    setShowModal(true)
  }

  async function openEdit(item: NewsPost) {
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
      scholarship_id: item.scholarship_id ?? '',
      university_id: item.university_id ?? '',
      slug: (item as any).slug ?? slugify(item.title_uz),
    })
    setMediaLinks((item as any).media_links ?? [])
    setError(null)
    setShowModal(true)
    // Load existing multi-select connections from join tables
    const sb = createClient()
    const [schRes, uniRes] = await Promise.all([
      sb.from('news_scholarships').select('scholarship_id').eq('news_id', item.id),
      sb.from('news_universities').select('university_id').eq('news_id', item.id),
    ])
    if (schRes.data && schRes.data.length > 0) {
      setSelectedScholarships(schRes.data.map((r: any) => r.scholarship_id))
    } else {
      // Fall back to single FK field
      setSelectedScholarships(item.scholarship_id ? [item.scholarship_id] : [])
    }
    if (uniRes.data && uniRes.data.length > 0) {
      setSelectedUniversities(uniRes.data.map((r: any) => r.university_id))
    } else {
      setSelectedUniversities(item.university_id ? [item.university_id] : [])
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
      // Keep single FK for backward compat (first selected)
      scholarship_id: selectedScholarships[0] || null,
      university_id: selectedUniversities[0] || null,
      slug: form.slug || slugify(form.title_uz) || null,
      media_links: mediaLinks.filter(l => l.url.trim()).length > 0 ? mediaLinks.filter(l => l.url.trim()) : null,
    }
    const supabase = createClient()
    let newsId = editId
    if (editId) {
      const res = await supabase.from('news_posts').update(payload).eq('id', editId)
      if (res.error) { setError(res.error.message); setSaving(false); return }
    } else {
      const res = await supabase.from('news_posts').insert(payload).select('id').single()
      if (res.error || !res.data) { setError(res.error?.message ?? 'Insert failed'); setSaving(false); return }
      newsId = res.data.id
    }
    // Save join table connections
    if (newsId) {
      const sb = createClient()
      // Try to save to join tables (may not exist yet — ignore errors)
      try {
        await sb.from('news_scholarships').delete().eq('news_id', newsId)
        await sb.from('news_universities').delete().eq('news_id', newsId)
        if (selectedScholarships.length > 0) {
          await sb.from('news_scholarships').insert(selectedScholarships.map(sid => ({ news_id: newsId, scholarship_id: sid })))
        }
        if (selectedUniversities.length > 0) {
          await sb.from('news_universities').insert(selectedUniversities.map(uid => ({ news_id: newsId, university_id: uid })))
        }
      } catch {}
    }
    setShowModal(false)
    load()
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
          onClick={e => e.stopPropagation()}
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

              {/* Sarlavha — all languages at once */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Sarlavha *</label>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-gray-400 w-6">🇺🇿</span>
                    <input required value={form.title_uz} onChange={e => setForm({ ...form, title_uz: e.target.value, slug: form.slug || slugify(e.target.value) })} placeholder="O'zbek..." className={`${inp} flex-1`} />
                    <TranslateFieldButton value={form.title_uz} onResult={(ru, en) => setForm(f => ({ ...f, title_ru: ru, title_en: en }))} />
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-gray-400 w-6">🇷🇺</span>
                    <input value={form.title_ru} onChange={e => setForm({ ...form, title_ru: e.target.value })} placeholder="Русский..." className={`${inp} flex-1`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 w-6">🇬🇧</span>
                    <input value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} placeholder="English..." className={`${inp} flex-1`} />
                  </div>
                </div>
              </div>

              {/* Matn — all languages at once */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Matn *</label>
                <div>
                  <div className="flex items-start gap-1 mb-1">
                    <span className="text-xs text-gray-400 w-6 pt-2">🇺🇿</span>
                    <textarea required rows={4} value={form.body_uz} onChange={e => setForm({ ...form, body_uz: e.target.value })} placeholder="O'zbek..." className={`${inp} flex-1`} />
                    <TranslateFieldButton value={form.body_uz} onResult={(ru, en) => setForm(f => ({ ...f, body_ru: ru, body_en: en }))} />
                  </div>
                  <div className="flex items-start gap-1 mb-1">
                    <span className="text-xs text-gray-400 w-6 pt-2">🇷🇺</span>
                    <textarea rows={4} value={form.body_ru} onChange={e => setForm({ ...form, body_ru: e.target.value })} placeholder="Русский..." className={`${inp} flex-1`} />
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-xs text-gray-400 w-6 pt-2">🇬🇧</span>
                    <textarea rows={4} value={form.body_en} onChange={e => setForm({ ...form, body_en: e.target.value })} placeholder="English..." className={`${inp} flex-1`} />
                  </div>
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL Slug (avtomatik)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inp} placeholder="yangilik-sarlavhasi" />
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

              {/* Multi-select scholarships */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Grantlar bilan bog&apos;lash (ixtiyoriy)</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1">
                  {scholarships.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedScholarships.includes(s.id)}
                        onChange={e => setSelectedScholarships(prev => e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{s.title} ({s.country})</span>
                    </label>
                  ))}
                  {scholarships.length === 0 && <p className="text-xs text-gray-400">Grant yo&apos;q</p>}
                </div>
              </div>

              {/* Multi-select universities */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Universitetlar bilan bog&apos;lash (ixtiyoriy)</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1">
                  {universities.map(u => (
                    <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedUniversities.includes(u.id)}
                        onChange={e => setSelectedUniversities(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id))}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{u.name} ({u.country})</span>
                    </label>
                  ))}
                  {universities.length === 0 && <p className="text-xs text-gray-400">Universitet yo&apos;q</p>}
                </div>
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

              <MediaLinksAdmin links={mediaLinks} onChange={setMediaLinks} />

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
