'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Inquiry } from '@/lib/supabase/types'

const inp =
  'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

const statusCfg: Record<Inquiry['status'], { label: string; cls: string; darkCls: string }> = {
  new: {
    label: 'Yangi',
    cls: 'bg-blue-100 text-blue-700',
    darkCls: 'dark:bg-blue-900/40 dark:text-blue-300',
  },
  contacted: {
    label: "Bog'landi",
    cls: 'bg-yellow-100 text-yellow-700',
    darkCls: 'dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  converted: {
    label: "Mijoz bo'ldi",
    cls: 'bg-green-100 text-green-700',
    darkCls: 'dark:bg-green-900/40 dark:text-green-300',
  },
  closed: {
    label: 'Yopiq',
    cls: 'bg-gray-100 text-gray-600',
    darkCls: 'dark:bg-gray-700 dark:text-gray-400',
  },
}

interface DetailPanelProps {
  item: Inquiry
  onClose: () => void
  onNotesChange: (id: string, notes: string) => void
}

function DetailPanel({ item, onClose, onNotesChange }: DetailPanelProps) {
  const [notes, setNotes] = useState(item.notes ?? '')
  const savedNotes = useRef(item.notes ?? '')
  const lastChangeTime = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save notes: save 5 s after last change if value differs from saved
  useEffect(() => {
    if (notes === savedNotes.current) return
    lastChangeTime.current = Date.now()

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (notes === savedNotes.current) return
      const { error } = await createClient()
        .from('inquiries')
        .update({ notes })
        .eq('id', item.id)
      if (!error) {
        savedNotes.current = notes
        onNotesChange(item.id, notes)
      }
    }, 5000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [notes, item.id, onNotesChange])

  // Flush on unmount if unsaved
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (notes !== savedNotes.current) {
        createClient().from('inquiries').update({ notes }).eq('id', item.id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const field = (label: string, value: string | undefined | null) =>
    value ? (
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200 break-words">{value}</p>
      </div>
    ) : null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 dark:bg-black/50"
        onClick={onClose}
      />
      {/* Panel */}
      <aside className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {item.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 flex-1">
          {/* Core fields */}
          {field('Telefon', item.phone)}
          {field('Email', item.email)}
          {field('Sana', new Date(item.created_at).toLocaleString('uz-UZ'))}
          {field('Xabar', item.message)}

          {/* New fields */}
          {field('Tug\'ilgan sana', item.dob)}
          {field('Til sertifikati', item.language_certificate)}
          {field('Grant qiziqishi', item.grant_interest)}
          {field('Universitet qiziqishi', item.university_interest)}

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Izohlar (notes)
              {notes !== savedNotes.current && (
                <span className="ml-2 text-teal-500 normal-case font-normal">
                  · saqlash kutilmoqda…
                </span>
              )}
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Admin izohlari..."
              className={`${inp} resize-y`}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              O'zgarishlar 5 soniyadan so'ng avtomatik saqlanadi
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function InquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Inquiry | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient()
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id: string, status: Inquiry['status']) {
    const { error } = await createClient().from('inquiries').update({ status }).eq('id', id)
    if (error) setError(error.message)
    else {
      setItems(prev => prev.map(item => (item.id === id ? { ...item, status } : item)))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
    }
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('inquiries').delete().eq('id', id)
    if (error) setError(error.message)
    else {
      setItems(prev => prev.filter(item => item.id !== id))
      if (selected?.id === id) setSelected(null)
    }
  }

  function handleNotesChange(id: string, notes: string) {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, notes } : item)))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, notes } : prev)
  }

  const newCount = items.filter(i => i.status === 'new').length

  const filtered = search.trim()
    ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Murojaatlar</h1>
        {newCount > 0 && (
          <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Yangi: {newCount}
          </span>
        )}
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ism bo'yicha qidirish..."
          className={`${inp} max-w-xs`}
        />
      </div>

      {loading ? (
        <div className="text-teal-700 dark:text-teal-400 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Ism</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Telefon</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Grant/Uni qiziqish</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isNew = item.status === 'new'
                const isSelected = selected?.id === item.id
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className={[
                      'border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer transition-colors',
                      isNew
                        ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                      isSelected ? 'bg-teal-50 dark:bg-teal-900/10' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {item.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[180px]">
                      <span
                        className="block truncate"
                        title={[item.grant_interest, item.university_interest]
                          .filter(Boolean)
                          .join(' / ')}
                      >
                        {[item.grant_interest, item.university_interest]
                          .filter(Boolean)
                          .join(' / ') || '—'}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={e => e.stopPropagation()}
                    >
                      <select
                        value={item.status}
                        onChange={e =>
                          updateStatus(item.id, e.target.value as Inquiry['status'])
                        }
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${statusCfg[item.status].cls} ${statusCfg[item.status].darkCls}`}
                      >
                        {(
                          Object.entries(statusCfg) as [
                            Inquiry['status'],
                            { label: string; cls: string; darkCls: string },
                          ][]
                        ).map(([val, { label }]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => del(item.id)}
                        className="text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        O'chir
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
                  >
                    Murojaatlar yo'q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail side panel */}
      {selected && (
        <DetailPanel
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
          onNotesChange={handleNotesChange}
        />
      )}
    </div>
  )
}
