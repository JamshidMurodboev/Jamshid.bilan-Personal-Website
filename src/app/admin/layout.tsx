'use client'

import { Inter } from 'next/font/google'
import '../globals.css'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inter = Inter({ subsets: ['latin'] })

const navLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/scholarships', label: 'Grantlar' },
  { href: '/admin/universities', label: 'Universitetlar' },
  { href: '/admin/results', label: 'Natijalar' },
  { href: '/admin/news', label: 'Yangiliklar' },
  { href: '/admin/inquiries', label: 'Murojaatlar' },
  { href: '/admin/about', label: 'Men haqimda' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session && pathname !== '/admin/login') {
        router.replace('/admin/login')
      } else {
        setUserEmail(data.session?.user?.email ?? null)
        setLoading(false)
      }
    })
  }, [pathname, router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return (
      <html lang="uz">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  if (loading) {
    return (
      <html lang="uz">
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-teal-700 text-lg font-medium animate-pulse">Yuklanmoqda...</div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="uz">
      <body className={inter.className}>
        <div className="min-h-screen flex bg-gray-50">
          <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
            <div className="p-5 border-b border-gray-200">
              <div className="text-teal-700 font-bold text-lg">Admin Panel</div>
              {userEmail && <div className="text-gray-500 text-xs mt-1 truncate">{userEmail}</div>}
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-left"
              >
                Chiqish
              </button>
            </div>
          </aside>
          <main className="flex-1 ml-60 p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
