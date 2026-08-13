'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const inp = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'

export default function AdminSettingsPage() {
  const [telegramLink, setTelegramLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .from('site_settings')
      .select('value')
      .eq('key', 'community_telegram_link')
      .single()
      .then(({ data }: { data: any }) => {
        if (data) setTelegramLink(data.value ?? '')
        setLoading(false)
      }, () => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(false)
    const sb = createClient()
    const { error } = await sb
      .from('site_settings')
      .upsert({ key: 'community_telegram_link', value: telegramLink }, { onConflict: 'key' })
    if (error) { setError(error.message) } else { setSuccess(true) }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sozlamalar</h1>

      {loading ? (
        <div className="text-teal-700 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 max-w-lg">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Telegram guruh havolasi
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Bu havola bo&apos;sh bo&apos;lsa, bosh sahifada jamoat bo&apos;limi ko&apos;rinmaydi.
              </p>
              <input
                type="url"
                value={telegramLink}
                onChange={e => setTelegramLink(e.target.value)}
                placeholder="https://t.me/your_group"
                className={inp}
              />
            </div>

            {error && <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</div>}
            {success && <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">Saqlandi!</div>}

            <button
              type="submit"
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-60 transition"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
