// Translation stub — replace with a real API call (DeepL/Google) when an API key is available.
// Currently returns empty strings for ru/en so admins can fill them manually,
// or replaces with uz text as a placeholder.
export async function autoTranslate(textUz: string): Promise<{ ru: string; en: string }> {
  // TODO: integrate DeepL or Google Translate API
  // Example DeepL integration:
  // const key = process.env.DEEPL_API_KEY
  // if (key && textUz) {
  //   const [ru, en] = await Promise.all([
  //     fetch(`https://api-free.deepl.com/v2/translate`, { method:'POST', body: new URLSearchParams({ auth_key: key, text: textUz, source_lang:'RU', target_lang:'RU' }) }).then(r=>r.json()),
  //     fetch(`https://api-free.deepl.com/v2/translate`, { method:'POST', body: new URLSearchParams({ auth_key: key, text: textUz, source_lang:'RU', target_lang:'EN' }) }).then(r=>r.json()),
  //   ])
  //   return { ru: ru.translations[0].text, en: en.translations[0].text }
  // }
  return { ru: '', en: '' }
}
