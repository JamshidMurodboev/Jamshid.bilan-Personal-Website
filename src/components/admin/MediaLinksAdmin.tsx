'use client'
import { useState } from 'react'
import type { MediaLink } from '@/lib/supabase/types'
import { autoTranslate } from '@/lib/translate'

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

function getYoutubeThumbnail(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg` : null
}

interface Props {
  links: MediaLink[]
  onChange: (links: MediaLink[]) => void
}

export default function MediaLinksAdmin({ links, onChange }: Props) {
  const [translating, setTranslating] = useState<Set<number>>(new Set())

  function add() {
    onChange([...links, { url: '', thumbnail: '', description_uz: '', description_ru: '', description_en: '' }])
  }

  function remove(i: number) {
    onChange(links.filter((_, j) => j !== i))
  }

  function update(i: number, field: keyof MediaLink, value: string) {
    onChange(links.map((l, j) => {
      if (j !== i) return l
      const updated = { ...l, [field]: value }
      if (field === 'url' && !updated.thumbnail) {
        updated.thumbnail = getYoutubeThumbnail(value) ?? ''
      }
      return updated
    }))
  }

  async function translateDesc(i: number) {
    if (!links[i].description_uz?.trim()) return
    setTranslating(prev => new Set(prev).add(i))
    try {
      const result = await autoTranslate(links[i].description_uz!)
      onChange(links.map((l, j) => j === i ? { ...l, description_ru: result.ru || l.description_ru || '', description_en: result.en || l.description_en || '' } : l))
    } finally {
      setTranslating(prev => { const s = new Set(prev); s.delete(i); return s })
    }
  }

  return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Media (YouTube / Instagram)</h3>
        <button type="button" onClick={add} className="text-xs text-teal-700 dark:text-teal-400 font-medium hover:underline">
          + Qo&apos;shish
        </button>
      </div>
      {links.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Media link qo&apos;shilmagan</p>
      ) : (
        <div className="space-y-3">
          {links.map((link, i) => (
            <div key={i} className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">Link {i + 1}</span>
                <button type="button" onClick={() => remove(i)} className="text-red-500 text-xs hover:underline">O&apos;chirish</button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">URL (YouTube yoki Instagram)</label>
                  <input
                    value={link.url}
                    onChange={e => update(i, 'url', e.target.value)}
                    className={inp}
                    placeholder="https://youtube.com/watch?v=... yoki https://instagram.com/p/..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Muqova rasm URL (YouTube uchun avtomatik)</label>
                  <input
                    value={link.thumbnail || ''}
                    onChange={e => update(i, 'thumbnail', e.target.value)}
                    className={inp}
                    placeholder="https://... (ixtiyoriy)"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Tavsif (UZ)</label>
                    <button type="button" onClick={() => translateDesc(i)} disabled={translating.has(i) || !link.description_uz?.trim()}
                      className="text-xs text-teal-700 dark:text-teal-400 hover:underline disabled:opacity-40">
                      {translating.has(i) ? 'Tarjimon...' : '✦ Tarjima'}
                    </button>
                  </div>
                  <input value={link.description_uz || ''} onChange={e => update(i, 'description_uz', e.target.value)} className={inp} placeholder="..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tavsif (RU)</label>
                    <input value={link.description_ru || ''} onChange={e => update(i, 'description_ru', e.target.value)} className={inp} placeholder="..." />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tavsif (EN)</label>
                    <input value={link.description_en || ''} onChange={e => update(i, 'description_en', e.target.value)} className={inp} placeholder="..." />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
