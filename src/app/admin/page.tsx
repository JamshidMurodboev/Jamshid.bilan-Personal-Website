'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Card { label: string; count: number; href: string }

export default function AdminDashboard() {
  const [cards, setCards] = useState<Card[]>([
    { label: 'Grantlar', count: 0, href: '/admin/scholarships' },
    { label: 'Universitetlar', count: 0, href: '/admin/universities' },
    { label: 'Yangiliklar', count: 0, href: '/admin/news' },
    { label: 'Talaba natijalari', count: 0, href: '/admin/results' },
    { label: 'Yangi murojaatlar', count: 0, href: '/admin/inquiries' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [s, u, n, r, i] = await Promise.all([
        supabase.from('scholarships').select('id', { count: 'exact', head: true }),
        supabase.from('universities').select('id', { count: 'exact', head: true }),
        supabase.from('news_posts').select('id', { count: 'exact', head: true }),
        supabase.from('student_results').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      ])
      setCards([
        { label: 'Grantlar', count: s.count ?? 0, href: '/admin/scholarships' },
        { label: 'Universitetlar', count: u.count ?? 0, href: '/admin/universities' },
        { label: 'Yangiliklar', count: n.count ?? 0, href: '/admin/news' },
        { label: 'Talaba natijalari', count: r.count ?? 0, href: '/admin/results' },
        { label: 'Yangi murojaatlar', count: i.count ?? 0, href: '/admin/inquiries' },
      ])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {loading ? (
        <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group block">
              <div className="text-4xl font-bold text-teal-700 group-hover:text-teal-800 mb-2">{card.count}</div>
              <div className="text-gray-600 text-sm font-medium">{card.label}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
