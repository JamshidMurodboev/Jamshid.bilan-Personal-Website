'use client'

import { Inter } from 'next/font/google'
import '../globals.css'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inter = Inter({ subsets: ['latin'] })

const navLinks = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/scholarships', label: 'Grantlar' },
  { href: '/admin/universities', label: 'Universitetlar' },
  { href: '/admin/results', label: 'Natijalar' },
  { href: '/admin/news', label: 'Yangiliklar' },
  { href: '/admin/testimonials', label: 'Talaba fikrlari' },
  { href: '/admin/faq', label: 'Savollar' },
  { href: '/admin/inquiries', label: 'Murojaatlar' },
  { href: '/admin/users', label: 'Foydalanuvchilar' },
  { href: '/admin/about', label: 'Men haqimda' },
]

function DarkToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('admin_theme')
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('admin_theme', next ? 'dark' : 'light')
  }

  if (!mounted) return <div className="w-8 h-8" />

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {dark ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
    </button>
  )
}

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
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-teal-700 text-lg font-medium animate-pulse">Yuklanmoqda...</div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="uz">
      <body className={inter.className}>
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
          <aside className="w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-10">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <div className="text-teal-700 dark:text-teal-400 font-bold text-base">Admin Panel</div>
                {userEmail && <div className="text-gray-400 text-xs mt-0.5 truncate max-w-[140px]">{userEmail}</div>}
              </div>
              <DarkToggle />
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSignOut}
                className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors text-left"
              >
                Chiqish
              </button>
            </div>
          </aside>
          <main className="flex-1 ml-60 p-8 text-gray-900 dark:text-gray-100">{children}</main>
        </div>
      </body>
    </html>
  )
}
