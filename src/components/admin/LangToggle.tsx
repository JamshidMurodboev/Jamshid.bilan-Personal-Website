'use client'

import { useEffect, useState } from 'react'

type Lang = 'uz' | 'ru' | 'en'

export default function LangToggle() {
  const [lang, setLang] = useState<Lang>('uz')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('admin_lang') as Lang | null
    if (saved && ['uz', 'ru', 'en'].includes(saved)) {
      setLang(saved)
    }
  }, [])

  function changeLang(next: Lang) {
    setLang(next)
    localStorage.setItem('admin_lang', next)
    window.dispatchEvent(new CustomEvent('admin-lang-change', { detail: next }))
  }

  if (!mounted) return <div className="w-20 h-8" />

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
      {(['uz', 'ru', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => changeLang(l)}
          className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors uppercase ${
            lang === l
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
