import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // NOTE: telegram_otp_sessions does not have a 'phone' column.
  // We store the phone value in the existing 'email' column.
  const { purpose, phone } = await req.json();

  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) return NextResponse.json({ error: 'Bot not configured' }, { status: 503 });

  // Rate limit: max 3 sessions per phone in 10 minutes (stored in email column)
  if (phone) {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('telegram_otp_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('email', phone)
      .gte('created_at', tenMinAgo);
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: "Juda ko'p urinish. 10 daqiqadan so'ng qayta urinib ko'ring." }, { status: 429 });
    }
  }

  // Store phone in the 'email' column (no schema change needed)
  const { data, error } = await supabase
    .from('telegram_otp_sessions')
    .insert({ purpose: purpose || 'signup', email: phone || null })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    sessionId: data.id,
    botLink: `https://t.me/${botUsername}?start=${data.id}`,
  });
}
