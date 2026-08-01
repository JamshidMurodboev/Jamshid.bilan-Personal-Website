'use client'
import { useState, useEffect } from 'react'

const PRESET_LANGUAGES = [
  { value: 'turkish', label: 'Turk tili' },
  { value: 'english', label: 'Ingliz tili' },
  { value: 'english30', label: '30% Ingliz tili' },
  { value: 'arabic', label: 'Arab tili' },
  { value: 'arabic30', label: '30% Arab tili' },
  { value: 'french', label: 'Fransuz tili' },
  { value: 'german', label: 'Nemis tili' },
  { value: 'russian', label: 'Rus tili' },
  { value: 'other', label: 'Boshqa...' },
]

const PRESET_VALUES = PRESET_LANGUAGES.filter(l => l.value !== 'other').map(l => l.value)

interface Props {
  value: string
  onChange: (v: string) => void
  className?: string
}

export default function LanguageSelect({ value, onChange, className }: Props) {
  const isOther = value && !PRESET_VALUES.includes(value)
  const [showCustom, setShowCustom] = useState(isOther)

  useEffect(() => {
    setShowCustom(value && !PRESET_VALUES.includes(value) ? true : false)
  }, [])

  const inp = className || 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    if (v === 'other') {
      setShowCustom(true)
      onChange('')
    } else {
      setShowCustom(false)
      onChange(v)
    }
  }

  const selectValue = showCustom ? 'other' : (value || '')

  return (
    <div className="space-y-2">
      <select value={selectValue} onChange={handleSelect} className={inp}>
        <option value="">Tanlang...</option>
        {PRESET_LANGUAGES.map(l => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </select>
      {showCustom && (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Ta'lim tilini kiriting..."
          className={inp}
        />
      )}
    </div>
  )
}
