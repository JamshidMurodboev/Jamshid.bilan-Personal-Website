export async function autoTranslate(textUz: string): Promise<{ ru: string; en: string }> {
  if (!textUz?.trim()) return { ru: '', en: '' }
  try {
    const res = await fetch('/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textUz }),
    })
    if (!res.ok) return { ru: '', en: '' }
    return await res.json()
  } catch {
    return { ru: '', en: '' }
  }
}
