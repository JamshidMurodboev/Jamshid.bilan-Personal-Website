import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requestPhoneContact(chatId: number) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: "📱 Tasdiqlash uchun telefon raqamingizni ulashing:",
      reply_markup: {
        keyboard: [[{ text: "📱 Raqamimni ulashish", request_contact: true }]],
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    }),
  });
}

async function sendMessage(chatId: number, text: string, removeKeyboard = true, parseMode?: string) {
  const body: Record<string, unknown> = { chat_id: chatId, text };
  if (removeKeyboard) body.reply_markup = { remove_keyboard: true };
  if (parseMode) body.parse_mode = parseMode;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (WEBHOOK_SECRET) {
    if (secret !== WEBHOOK_SECRET) return NextResponse.json({ ok: false }, { status: 403 });
  } else {
    console.warn('[telegram/webhook] TELEGRAM_WEBHOOK_SECRET is not set — set it to secure the webhook');
  }

  const body = await req.json();
  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId: number = message.chat?.id;
  const text: string = message.text || '';

  // Step 1: /start {sessionId} — request contact verification
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

    // Update session to awaiting_contact and ask user to share phone
    await supabase
      .from('telegram_otp_sessions')
      .update({ chat_id: chatId, status: 'awaiting_contact' })
      .eq('id', sessionId);

    await requestPhoneContact(chatId);
    return NextResponse.json({ ok: true });
  }

  // Step 2: Contact message received — verify phone matches session
  if (message.contact) {
    const contactPhone = message.contact.phone_number.replace(/\D/g, '');

    // Find the pending session for this chat
    const { data: session } = await supabase
      .from('telegram_otp_sessions')
      .select('*')
      .eq('chat_id', chatId)
      .eq('status', 'awaiting_contact')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!session) {
      await sendMessage(chatId, "⚠️ Faol sessiya topilmadi. Saytdan qayta urinib ko'ring.");
      return NextResponse.json({ ok: true });
    }

    // NOTE: phone is stored in the 'email' column of telegram_otp_sessions
    const sessionPhone = (session.email || '').replace(/\D/g, '');

    if (contactPhone !== sessionPhone) {
      // Phone mismatch — ask again
      await sendMessage(chatId, "❌ Raqam mos kelmadi. Ro'yxatdan o'tayotgan raqamingizni ulashing.", false);
      await requestPhoneContact(chatId);
      return NextResponse.json({ ok: true });
    }

    // Phone matched — generate OTP and mark as linked
    const otp = generateOTP();

    await supabase
      .from('telegram_otp_sessions')
      .update({ otp, status: 'linked' })
      .eq('id', session.id);

    const purposeText = session.purpose === 'reset' ? 'parolni tiklash' : "ro'yxatdan o'tish";
    await sendMessage(
      chatId,
      `🔐 Jamshid.bilan - ${purposeText} kodi:\n\n*${otp}*\n\nKodni saytga kiriting. Muddat: 10 daqiqa.`,
      true,
      'Markdown'
    );

    return NextResponse.json({ ok: true });
  }

  await sendMessage(chatId, "Salom! Saytdan tasdiqlash havolasini bosing.");
  return NextResponse.json({ ok: true });
}
