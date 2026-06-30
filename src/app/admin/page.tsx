'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Stats {
  users: number
  scholarships: number
  universities: number
  results: number
  news: number
  inquiries: number
}

interface MonthlyData {
  month: string
  count: number
}

interface RecentUser {
  id: string
  name: string
  created_at: string
}

interface PieData {
  name: string
  value: number
}

const MONTH_LABELS = [
  'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn',
  'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek',
]

const PIE_COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f97316']

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    if (started.current) return
    started.current = true
    const steps = 40
    const interval = duration / steps
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [target, duration])

  return count
}

function StatCard({
  label,
  value,
  gradient,
  icon,
}: {
  label: string
  value: number
  gradient: string
  icon: React.ReactNode
}) {
  const count = useCountUp(value)

  return (
    <div className={`rounded-xl p-5 text-white shadow-md flex items-center gap-4 ${gradient}`}>
      <div className="bg-white/20 rounded-lg p-3 flex-shrink-0">{icon}</div>
      <div>
        <div className="text-3xl font-bold">{count}</div>
        <div className="text-sm opacity-90 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    scholarships: 0,
    universities: 0,
    results: 0,
    news: 0,
    inquiries: 0,
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [barData, setBarData] = useState<{ name: string; count: number }[]>([])
  const [pieData, setPieData] = useState<PieData[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchAll() {
      const [
        { count: usersCount },
        { count: scholarshipsCount },
        { count: universitiesCount },
        { count: resultsCount },
        { count: newsCount },
        { count: inquiriesCount },
        { data: usersCreated },
        { data: resultsData },
        { data: recentUsersData },
      ] = await Promise.all([
        supabase.from('site_users').select('*', { count: 'exact', head: true }),
        supabase.from('scholarships').select('*', { count: 'exact', head: true }),
        supabase.from('universities').select('*', { count: 'exact', head: true }),
        supabase.from('student_results').select('*', { count: 'exact', head: true }),
        supabase.from('news_posts').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('site_users').select('created_at').order('created_at', { ascending: true }),
        supabase.from('student_results').select('category'),
        supabase.from('site_users').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        users: usersCount ?? 0,
        scholarships: scholarshipsCount ?? 0,
        universities: universitiesCount ?? 0,
        results: resultsCount ?? 0,
        news: newsCount ?? 0,
        inquiries: inquiriesCount ?? 0,
      })

      // Build last 12 months map
      const now = new Date()
      const monthly: Record<string, number> = {}
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthly[key] = 0
      }
      if (usersCreated) {
        for (const u of usersCreated) {
          const d = new Date(u.created_at)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          if (key in monthly) monthly[key]++
        }
      }
      setMonthlyData(
        Object.entries(monthly).map(([key, count]) => {
          const [year, month] = key.split('-')
          return { month: `${MONTH_LABELS[parseInt(month) - 1]} ${year.slice(2)}`, count }
        })
      )

      setBarData([
        { name: 'Grantlar', count: scholarshipsCount ?? 0 },
        { name: 'Universitetlar', count: universitiesCount ?? 0 },
      ])

      const catMap: Record<string, number> = {}
      if (resultsData) {
        for (const r of resultsData) {
          const cat: string = (r as { category?: string }).category ?? 'other'
          catMap[cat] = (catMap[cat] ?? 0) + 1
        }
      }
      const categoryLabels: Record<string, string> = {
        scholarship_winner: "Grant sovrindori",
        tuition_based: "To'lov asosida",
        other: 'Boshqa',
      }
      setPieData(
        Object.entries(catMap).map(([key, value]) => ({
          name: categoryLabels[key] ?? key,
          value,
        }))
      )

      setRecentUsers(
        ((recentUsersData ?? []) as RecentUser[]).map((u) => ({
          id: u.id,
          name: u.name ?? 'Nomsiz',
          created_at: u.created_at,
        }))
      )

      setLoading(false)
    }

    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 text-sm animate-pulse">
        Yuklanmoqda...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Foydalanuvchilar"
          value={stats.users}
          gradient="bg-gradient-to-br from-teal-500 to-teal-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-4m-4 6H2v-2a4 4 0 015-4m4 0a4 4 0 110-8 4 4 0 010 8zm6-4a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          label="Grantlar"
          value={stats.scholarships}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5" />
            </svg>
          }
        />
        <StatCard
          label="Universitetlar"
          value={stats.universities}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          }
        />
        <StatCard
          label="Natijalar"
          value={stats.results}
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
        <StatCard
          label="Yangiliklar"
          value={stats.news}
          gradient="bg-gradient-to-br from-green-500 to-green-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 2v6h6M9 15h6M9 11h6M9 7h2" />
            </svg>
          }
        />
        <StatCard
          label="Yangi murojaatlar"
          value={stats.inquiries}
          gradient="bg-gradient-to-br from-red-500 to-red-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Oylik ro&apos;yxatdan o&apos;tishlar
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f9fafb',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ fill: '#0d9488', r: 3 }}
                activeDot={{ r: 5 }}
                name="Foydalanuvchilar"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Grantlar vs Universitetlar
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={50}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f9fafb',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="Soni" radius={[6, 6, 0, 0]}>
                {barData.map((_, index) => (
                  <Cell key={index} fill={index === 0 ? '#0d9488' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + Recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Natijalar kategoriyasi
          </h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
              Ma&apos;lumot yo&apos;q
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f9fafb',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span
                      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                    <span className="ml-auto font-semibold text-gray-800 dark:text-gray-100">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Yangi foydalanuvchilar
          </h2>
          {recentUsers.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
              Foydalanuvchilar yo&apos;q
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 font-semibold text-sm">
                      {(user.name ?? 'N')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {user.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('uz-UZ', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
