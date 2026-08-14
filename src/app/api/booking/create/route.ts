import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

async function sendTg(chatId: string | number, text: string) {
  if (!BOT_TOKEN || !chatId) return;
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: String(chatId), text, parse_mode: 'HTML' }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[booking] Telegram error:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, tg_username, topic, preferred_date, preferred_time, locale } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });

    const cleanTg = tg_username?.trim().replace(/^@/, '') || null;

    const { error: dbErr } = await supabaseAdmin.from('consultations').insert({
      name: name.trim(),
      phone: phone.trim(),
      tg_username: cleanTg,
      topic: topic?.trim() || null,
      preferred_date: preferred_date || null,
      preferred_time: preferred_time?.trim() || null,
      status: 'pending',
    });

    if (dbErr) {
      console.error('[booking] DB error:', dbErr.message);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    // Admin notification
    if (ADMIN_CHAT_ID) {
      const lines = [
        "📅 <b>Yangi konsultatsiya so'rovi!</b>",
        `👤 <b>Ism:</b> ${name.trim()}`,
        `📞 <b>Telefon:</b> ${phone.trim()}`,
      ];
      if (cleanTg) lines.push(`💬 <b>Telegram:</b> <a href="https://t.me/${cleanTg}">@${cleanTg}</a>`);
      if (topic?.trim()) lines.push(`📝 <b>Mavzu:</b> ${topic.trim()}`);
      if (preferred_date) lines.push(`📆 <b>Sana:</b> ${preferred_date}`);
      if (preferred_time?.trim()) lines.push(`🕐 <b>Vaqt:</b> ${preferred_time.trim()}`);
      if (locale) lines.push(`🌐 <b>Til:</b> ${locale}`);
      await sendTg(ADMIN_CHAT_ID, lines.join('\n'));
    }

    // User notification — look up their Telegram chat_id by username from site_users
    if (cleanTg) {
      const { data: userRow } = await supabaseAdmin
        .from('site_users')
        .select('telegram_chat_id')
        .ilike('telegram_username', cleanTg)
        .maybeSingle();

      if (userRow?.telegram_chat_id) {
        const confirmLines = locale === 'ru'
          ? ["✅ <b>Ваша заявка на консультацию принята!</b>", "Мы свяжемся с вами в ближайшее время."]
          : locale === 'en'
          ? ["✅ <b>Your consultation request has been received!</b>", "We will get in touch with you shortly."]
          : ["✅ <b>Konsultatsiya so'rovingiz qabul qilindi!</b>", "Tez orada siz bilan bog'lanamiz."];
        await sendTg(userRow.telegram_chat_id, confirmLines.join('\n'));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[booking] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
