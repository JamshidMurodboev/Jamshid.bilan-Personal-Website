'use client'
import { useState, useRef, useEffect } from 'react'
import { COUNTRIES } from '@/lib/countries'

interface Props {
  value: string
  onChange: (v: string) => void
  required?: boolean
  className?: string
  placeholder?: string
}

export default function CountrySelect({ value, onChange, required, className, placeholder = 'Davlatni tanlang' }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? COUNTRIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  function select(c: string) {
    onChange(c)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50) }}
        className={`w-full text-left flex items-center justify-between ${className || 'border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500'}`}
      >
        <span className={value ? '' : 'text-gray-400'}>{value || placeholder}</span>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {required && <input type="text" required value={value} readOnly className="sr-only" tabIndex={-1} />}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-56 flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Qidirish..."
              className="w-full text-sm px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0
              ? <p className="px-3 py-2 text-sm text-gray-400">Topilmadi</p>
              : filtered.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => select(c)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/30 ${c === value ? 'text-teal-700 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/20' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  {c}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
