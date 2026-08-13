import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendTelegramNotification(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!botToken || !adminChatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminChatId, text, parse_mode: 'HTML' }),
    });
  } catch {
    // ignore notification errors
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, topic, preferred_date, preferred_time, locale } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('consultations').insert({
      name: name.trim(),
      phone: phone.trim(),
      topic: topic?.trim() || null,
      preferred_date: preferred_date || null,
      preferred_time: preferred_time?.trim() || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send Telegram notification
    const parts = [
      '📅 <b>Yangi konsultatsiya so\'rovi</b>',
      `👤 <b>Ism:</b> ${name.trim()}`,
      `📞 <b>Telefon:</b> ${phone.trim()}`,
    ];
    if (topic?.trim()) parts.push(`💬 <b>Mavzu:</b> ${topic.trim()}`);
    if (preferred_date) parts.push(`📆 <b>Qulay sana:</b> ${preferred_date}`);
    if (preferred_time?.trim()) parts.push(`🕐 <b>Qulay vaqt:</b> ${preferred_time.trim()}`);
    if (locale) parts.push(`🌐 <b>Til:</b> ${locale}`);
    await sendTelegramNotification(parts.join('\n'));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
