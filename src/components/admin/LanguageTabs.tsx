'use client'

export type LangTab = 'uz' | 'ru' | 'en'

interface Props {
  activeTab: LangTab
  onTabChange: (tab: LangTab) => void
  onTranslateAll?: () => void
  translating?: boolean
  translateProgress?: string
}

const TABS: { key: LangTab; flag: string; label: string }[] = [
  { key: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { key: 'ru', flag: '🇷🇺', label: 'Русский' },
  { key: 'en', flag: '🇬🇧', label: 'English' },
]

export default function LanguageTabs({ activeTab, onTabChange, onTranslateAll, translating, translateProgress }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.flag}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
