const TRANSLITERATION: Record<string, string> = {
  "'": '', '‘': '', '’': '', 'ʼ': '',
  'ā': 'a', 'č': 'c', 'ğ': 'g', 'ı': 'i', 'ō': 'o', 'š': 's', 'ū': 'u', 'ž': 'z',
  'ä': 'a', 'ö': 'o', 'ü': 'u', 'ñ': 'n',
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['‘’ʼāčğıōšūžäöüñ]/g, c => TRANSLITERATION[c] ?? c)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}
