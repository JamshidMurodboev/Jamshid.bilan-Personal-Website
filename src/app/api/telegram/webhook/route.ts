import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await req.json();
  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId: number = message.chat?.id;
  const text: string = message.text || '';

  if (text.startsWith('/start ')) {
    const sessionId = text.slice(7).trim();

    const { data: session, error } = await supabase
      .from('telegram_otp_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      await sendMessage(chatId, "⚠️ Havola noto'g'ri yoki muddati o'tgan.");
      return NextResponse.json({ ok: true });
    }

    if (new Date(session.expires_at) < new Date()) {
      await sendMessage(chatId, "⌛ Havola muddati o'tgan. Qayta urinib ko'ring.");
      return NextResponse.json({ ok: true });
    }

    if (session.status !== 'pending') {
      await sendMessage(chatId, "✅ Bu kod allaqachon ishlatilgan.");
      return NextResponse.json({ ok: true });
    }

    const otp = generateOTP();

    await supabase
      .from('telegram_otp_sessions')
      .update({ chat_id: chatId, otp, status: 'linked' })
      .eq('id', sessionId);

    const purposeText = session.purpose === 'reset' ? 'parolni tiklash' : "ro'yxatdan o'tish";
    await sendMessage(
      chatId,
      `🔐 *Jamshid.bilan* — ${purposeText} kodi:\n\n*${otp}*\n\nKodni saytga kiriting. Muddat: 10 daqiqa.`
    );

    return NextResponse.json({ ok: true });
  }

  await sendMessage(chatId, "Salom! Saytdan tasdiqlash havolasini bosing.");
  return NextResponse.json({ ok: true });
}
