import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are a data extraction assistant for an educational consulting admin panel.
The admin will paste raw text (in any language — Uzbek, Russian, English, or mixed) about one of these content types:
- scholarship
- university
- student_result
- news
- testimonial

Your job:
1. Detect the content type.
2. Extract all relevant fields as JSON.
3. Translate/fill multilingual fields (uz, ru, en) if the text is in one language — do your best to translate.

Return ONLY valid JSON in this exact structure (no extra text):
{
  "type": "<scholarship|university|student_result|news|testimonial>",
  "confidence": "<high|medium|low>",
  "data": { ...fields }
}

Field schemas by type:

scholarship:
{
  "title": "", "country": "", "university": "",
  "description_uz": "", "description_ru": "", "description_en": "",
  "open_date": "", "close_date": "", "results_date": "",
  "results_date_type": "exact|month|period",
  "category": "fully_funded|partially_funded|self_funded",
  "application_url": "", "status": "open|closed|upcoming",
  "coverage": []
}

university:
{
  "name": "", "country": "", "city": "",
  "description_uz": "", "description_ru": "", "description_en": "",
  "website_url": "", "type": "public|private", "ranking": null,
  "majors": [{ "name": "", "language": "", "tuition": null, "currency": "USD" }]
}

student_result:
{
  "student_name": "", "degree_level": "bachelor|master|phd",
  "year": null, "country": "",
  "category": "scholarship_winner|tuition_based",
  "university_name": "", "major": "", "language": "",
  "university_ranking": null, "testimonial": ""
}

news:
{
  "title_uz": "", "title_ru": "", "title_en": "",
  "body_uz": "", "body_ru": "", "body_en": "",
  "published": true
}

testimonial:
{
  "student_name": "",
  "quote_uz": "", "quote_ru": "", "quote_en": "",
  "outcome_uz": "", "outcome_ru": "", "outcome_en": "",
  "category": "scholarship_winner|tuition_based"
}

Leave fields as empty string or null if not found in the text. Do not invent facts.`

export async function POST(req: NextRequest) {
  // Verify admin session
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 503 })

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2048,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message || 'Groq API error')
    const raw = json.choices[0].message.content.trim()
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI parse failed' }, { status: 500 })
  }
}
