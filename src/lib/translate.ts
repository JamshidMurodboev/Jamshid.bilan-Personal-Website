export async function autoTranslate(text: string): Promise<{ ru: string; en: string }> {
  if (!text?.trim()) return { ru: '', en: '' }
  try {
    const res = await fetch('/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error('Translation failed')
    const data = await res.json()
    return { ru: data.ru || '', en: data.en || '' }
  } catch (e) {
    console.error('autoTranslate error:', e)
    return { ru: '', en: '' }
  }
}
