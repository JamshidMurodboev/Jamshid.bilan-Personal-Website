import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ ru: '', en: '' })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 503 })

  const SYSTEM = `You are a professional translator. Translate the following Uzbek text to Russian and English.

STRICT rules — follow exactly:
1. Preserve ALL emojis exactly as they appear (do NOT remove or change them)
2. Preserve ALL paragraph breaks — each paragraph in the original becomes its own paragraph
3. Preserve ALL formatting: bullet points, numbered lists, dashes, icons, line breaks
4. Do NOT merge paragraphs into one — if the original has 5 paragraphs, the translation must also have 5 paragraphs
5. Return ONLY valid JSON — no markdown, no code fences, no extra text
6. In the JSON string values, represent line breaks as \\n (escaped backslash-n)
7. Format: {"ru": "translated text here", "en": "translated text here"}`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'qwen/qwen3.6-27b',
        max_tokens: 4096,
        temperature: 0.05,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Translate this text:\n\n${text}` },
        ],
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message || 'Groq error')
    let raw = json.choices[0].message.content.trim()

    raw = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()

    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON object found in LLM response')

    let jsonStr = match[0]

    let fixed = ''
    let inString = false
    let escaped = false
    for (let i = 0; i < jsonStr.length; i++) {
      const ch = jsonStr[i]
      if (escaped) {
        fixed += ch
        escaped = false
        continue
      }
      if (ch === '\\') {
        fixed += ch
        escaped = true
        continue
      }
      if (ch === '"') {
        inString = !inString
        fixed += ch
        continue
      }
      if (inString && ch === '\n') {
        fixed += '\\n'
        continue
      }
      if (inString && ch === '\r') {
        fixed += '\\r'
        continue
      }
      fixed += ch
    }

    const parsed = JSON.parse(fixed)
    return NextResponse.json({ ru: parsed.ru || '', en: parsed.en || '' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
