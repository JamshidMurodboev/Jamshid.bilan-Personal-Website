'use client'

import { Inter } from 'next/font/google'
import '../globals.css'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

const navLinks = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/scholarships', label: 'Grantlar' },
  { href: '/admin/universities', label: 'Universitetlar' },
  { href: '/admin/results', label: 'Natijalar' },
  { href: '/admin/news', label: 'Yangiliklar' },
  { href: '/admin/services', label: 'Xizmatlar' },
  { href: '/admin/process', label: 'Jarayon' },
  { href: '/admin/faq', label: 'Savollar' },
  { href: '/admin/inquiries', label: 'Murojaatlar' },
  { href: '/admin/users', label: 'Foydalanuvchilar' },
  { href: '/admin/ai-assistant', label: '✦ AI Yordamchi' },
  { href: '/admin/about', label: 'Men haqimda' },
]

function LangToggle() {
  const [lang, setLang] = useState('uz')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLang(localStorage.getItem('admin_lang') || 'uz')
  }, [])

  function pick(l: string) {
    setLang(l)
    localStorage.setItem('admin_lang', l)
    window.dispatchEvent(new CustomEvent('admin-lang-change', { detail: l }))
  }

  const [open, setOpen] = useState(false)

  if (!mounted) return <div className="w-8 h-8" />

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Switch language"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
          {['uz', 'ru', 'en'].map(l => (
            <button key={l} onClick={() => { pick(l); setOpen(false) }}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                lang === l
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }
    // If already authenticated, skip re-checking on every navigation
    if (userEmail) {
      setLoading(false)
      return
    }
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.replace('/admin/login')
        } else {
          setUserEmail(data.email ?? null)
          setLoading(false)
        }
      })
      .catch(() => router.replace('/admin/login'))
  }, [pathname, router])

  async function handleSignOut() {
    await fetch('/api/admin/logout', { method: 'POST' })
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

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <div className="text-teal-700 dark:text-teal-400 font-bold text-base">Admin Panel</div>
          {userEmail && <div className="text-gray-400 text-xs mt-0.5 truncate max-w-[140px]">{userEmail}</div>}
        </div>
        <div className="flex items-center gap-1">
          <LangToggle />
          <DarkToggle />
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <Link
          href="/uz"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21H15v-6H9v6H3V9.75z" />
          </svg>
          Saytni ko'rish
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors text-left"
        >
          Chiqish
        </button>
      </div>
    </>
  )

  return (
    <html lang="uz">
      <body className={inter.className}>
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">

          {/* Desktop sidebar */}
          <aside className="hidden lg:flex w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col fixed h-full z-10">
            {sidebarContent}
          </aside>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile sidebar drawer */}
          <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-30 transform transition-transform duration-200 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {sidebarContent}
          </aside>

          {/* Main content */}
          <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
            {/* Mobile top bar */}
            <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-teal-700 dark:text-teal-400 font-bold text-sm">Admin Panel</span>
            </div>

            <main className="flex-1 p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
