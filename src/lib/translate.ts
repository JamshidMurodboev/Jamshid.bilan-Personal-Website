export async function autoTranslate(text: string): Promise<{ ru: string; en: string }> {
  if (!text?.trim()) return { ru: '', en: '' }
  const res = await fetch('/api/admin/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || `Xato ${res.status}`)
  }
  const data = await res.json()
  return { ru: data.ru || '', en: data.en || '' }
}
