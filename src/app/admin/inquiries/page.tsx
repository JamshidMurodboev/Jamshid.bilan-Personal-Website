'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Inquiry } from '@/lib/supabase/types'

const statusCfg: Record<Inquiry['status'], { label: string; cls: string }> = {
  new: { label: 'Yangi', cls: 'bg-blue-100 text-blue-700' },
  contacted: { label: "Bog'landi", cls: 'bg-yellow-100 text-yellow-700' },
  converted: { label: "Mijoz bo'ldi", cls: 'bg-green-100 text-green-700' },
  closed: { label: 'Yopiq', cls: 'bg-gray-100 text-gray-600' },
}

export default function InquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await createClient().from('inquiries').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message); else setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: Inquiry['status']) {
    const { error } = await createClient().from('inquiries').update({ status }).eq('id', id)
    if (error) setError(error.message)
    else setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item))
  }

  async function del(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    const { error } = await createClient().from('inquiries').delete().eq('id', id)
    if (error) setError(error.message); else setItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Murojaatlar</h1>
      {error && <div className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      {loading ? <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Ism</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Telefon</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Xabar</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{item.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px]"><span className="block truncate" title={item.message ?? ''}>{item.message ? (item.message.length > 50 ? item.message.slice(0, 50) + '…' : item.message) : '—'}</span></td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      onChange={e => updateStatus(item.id, e.target.value as Inquiry['status'])}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${statusCfg[item.status].cls}`}
                    >
                      {(Object.entries(statusCfg) as [Inquiry['status'], { label: string; cls: string }][]).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(item.created_at).toLocaleDateString('uz-UZ')}</td>
                  <td className="px-4 py-3"><button onClick={() => del(item.id)} className="text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50">O'chir</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Murojaatlar yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
