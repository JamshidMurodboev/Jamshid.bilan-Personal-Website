'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SiteUser, UserActivity } from '@/lib/supabase/types'

const inp =
  'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

type StatusFilter = 'all' | 'active' | 'blocked'

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
        Faol
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
      Bloklangan
    </span>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-1">
      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  )
}

function formatDate(val: string | null | undefined) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatDateTime(val: string | null | undefined) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface DetailModalProps {
  user: SiteUser
  onClose: () => void
}

function DetailModal({ user, onClose }: DetailModalProps) {
  const [activities, setActivities] = useState<UserActivity[]>([])

  useEffect(() => {
    createClient()
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setActivities(data ?? []))
  }, [user.id])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Foydalanuvchi ma'lumotlari
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {user.photo_url && (
            <div className="flex justify-center">
              <img
                src={user.photo_url}
                alt={user.full_name ?? ''}
                className="w-20 h-20 rounded-full object-cover border-2 border-teal-500"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Field label="ID" value={user.id} />
            <Field label="To'liq ismi" value={user.full_name} />
            <Field label="Email" value={user.email} />
            <Field label="Telefon" value={user.phone} />
            <Field label="Jinsi" value={user.gender} />
            <Field label="Tug'ilgan sana" value={formatDate(user.dob)} />
            <Field label="Ro'yxatdan o'tgan" value={formatDateTime(user.created_at)} />
            <Field label="Oxirgi faollik" value={formatDateTime(user.last_active_at)} />
            <Field label="Kirish soni" value={String(user.login_count ?? 0)} />
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Holati</span>
              <StatusBadge status={user.status ?? 'active'} />
            </div>
            <Field label="Til sertifikati" value={user.language_certificate} />
          </div>
        </div>
        {activities.length > 0 && (
          <div className="px-6 pb-5">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">So&apos;nggi faollik</h3>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {activities.map(a => (
                <li key={a.id} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-1.5" />
                  <div>
                    <span className="text-gray-800 dark:text-gray-200">
                      {a.entity_name || a.entity_type} — {a.entity_type}
                    </span>
                    <span className="text-gray-400 ml-2">{a.visited_at ? formatDateTime(a.visited_at) : '—'}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 break-all">{value || '—'}</span>
    </div>
  )
}

type ShareEvent = { id: string; entity_type: string; entity_name: string | null; platform: string; user_name: string | null; created_at: string }

export default function UsersPage() {
  const supabase = createClient()

  const [users, setUsers] = useState<SiteUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedUser, setSelectedUser] = useState<SiteUser | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [shares, setShares] = useState<ShareEvent[]>([])
  const [sharesLoading, setSharesLoading] = useState(true)

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_users')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setUsers(data as SiteUser[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
    supabase.from('share_events').select('*, site_users(full_name)').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      setShares((data ?? []) as ShareEvent[])
      setSharesLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const now = Date.now()
  const week = 7 * 24 * 60 * 60 * 1000
  const month = 30 * 24 * 60 * 60 * 1000

  const stats = useMemo(() => {
    const total = users.length
    const newWeek = users.filter(
      (u) => u.created_at && now - new Date(u.created_at).getTime() < week
    ).length
    const newMonth = users.filter(
      (u) => u.created_at && now - new Date(u.created_at).getTime() < month
    ).length
    const activeCount = users.filter((u) => u.status === 'active').length
    return { total, newWeek, newMonth, activeCount }
  }, [users])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter((u) => {
      const matchSearch =
        !q ||
        (u.full_name ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q)
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.status === 'active') ||
        (statusFilter === 'blocked' && u.status === 'blocked')
      return matchSearch && matchStatus
    })
  }, [users, search, statusFilter])

  async function handleToggleStatus(user: SiteUser) {
    const newStatus = user.status === 'active' ? 'blocked' : 'active'
    setTogglingId(user.id)
    const { error } = await supabase
      .from('site_users')
      .update({ status: newStatus })
      .eq('id', user.id)
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      )
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : prev))
      }
    }
    setTogglingId(null)
  }

  async function handleDelete(user: SiteUser) {
    if (!confirm(`"${user.full_name ?? user.email}" ni o'chirishni tasdiqlaysizmi?`)) return
    setDeletingId(user.id)
    const { error } = await supabase.from('site_users').delete().eq('id', user.id)
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      if (selectedUser?.id === user.id) setSelectedUser(null)
    }
    setDeletingId(null)
  }

  const tabClass = (tab: StatusFilter) =>
    `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      statusFilter === tab
        ? 'bg-teal-700 text-white'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`

  return (
    <div className="ml-60 p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      {selectedUser && (
        <DetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Foydalanuvchilar
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Jami foydalanuvchilar" value={stats.total} />
        <StatCard label="Shu hafta yangi" value={stats.newWeek} />
        <StatCard label="Shu oy yangi" value={stats.newMonth} />
        <StatCard label="Faol" value={stats.activeCount} />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Ism yoki email bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inp}
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className={tabClass('all')} onClick={() => setStatusFilter('all')}>
            Barchasi
          </button>
          <button className={tabClass('active')} onClick={() => setStatusFilter('active')}>
            Faol
          </button>
          <button className={tabClass('blocked')} onClick={() => setStatusFilter('blocked')}>
            Bloklangan
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-500 text-sm">
            Yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-500 text-sm">
            Foydalanuvchilar topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {[
                    "To'liq ismi",
                    'Email',
                    'Telefon',
                    'Jinsi',
                    "Tug'ilgan sana",
                    "Ro'yxatdan",
                    'Oxirgi faollik',
                    'Kirish',
                    'Holat',
                    'Amallar',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.photo_url ? (
                          <img
                            src={user.photo_url}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300 text-xs font-bold flex-shrink-0">
                            {(user.full_name ?? user.email ?? '?')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-gray-100 max-w-[140px] truncate">
                          {user.full_name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[160px] truncate whitespace-nowrap">
                      {user.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {user.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {user.gender || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(user.dob)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(user.last_active_at)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                      {user.login_count ?? 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={user.status ?? 'active'} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1 rounded-md text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                        >
                          Ko'rish
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={togglingId === user.id}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
                            user.status === 'active'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
                              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                          }`}
                        >
                          {togglingId === user.id
                            ? '...'
                            : user.status === 'active'
                            ? 'Bloklash'
                            : 'Ochish'}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          className="px-3 py-1 rounded-md text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                        >
                          {deletingId === user.id ? '...' : "O'chirish"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
        Jami: {filtered.length} ta foydalanuvchi ko'rsatilmoqda
      </p>

      {/* Shares section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ulashishlar</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {sharesLoading ? (
            <div className="p-6 text-teal-600 animate-pulse text-sm">Yuklanmoqda...</div>
          ) : shares.length === 0 ? (
            <div className="p-6 text-gray-400 text-sm">Hali ulashish yo'q</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Sana</th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Platforma</th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Kontent</th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Foydalanuvchi</th>
                </tr>
              </thead>
              <tbody>
                {shares.map(s => (
                  <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateTime(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        s.platform === 'telegram' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        s.platform === 'whatsapp' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        s.platform === 'instagram' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>{s.platform}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      <span className="text-xs text-gray-400 mr-1">[{s.entity_type}]</span>{s.entity_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{(s as any).site_users?.full_name || s.user_name || 'Anonim'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
