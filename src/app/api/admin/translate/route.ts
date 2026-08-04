import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ ru: '', en: '' })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 503 })

  const SYSTEM = `You are a professional translator. Translate the following text from Uzbek to Russian and English.
IMPORTANT rules:
- Preserve ALL emojis exactly as they appear
- Preserve ALL line breaks, paragraph breaks, and spacing
- Preserve ALL formatting (bullets, numbers, dashes)
- Do not add or remove any content
- Return ONLY a JSON object: {"ru": "...", "en": "..."}
- The translated text must have the same structure and paragraphs as the original
- No extra text, no markdown fences, no code blocks — only the raw JSON object`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4096,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: text },
        ],
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message || 'Groq error')
    let raw = json.choices[0].message.content.trim()
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(raw)
    return NextResponse.json({ ru: parsed.ru || '', en: parsed.en || '' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
