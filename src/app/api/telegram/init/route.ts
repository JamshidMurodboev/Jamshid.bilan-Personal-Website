import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { purpose, email } = await req.json();

  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) return NextResponse.json({ error: 'Bot not configured' }, { status: 503 });

  // Rate limit: max 3 sessions per email in 10 minutes
  if (email) {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('telegram_otp_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', tenMinAgo);
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: "Juda ko'p urinish. 10 daqiqadan so'ng qayta urinib ko'ring." }, { status: 429 });
    }
  }

  const { data, error } = await supabase
    .from('telegram_otp_sessions')
    .insert({ purpose: purpose || 'signup', email: email || null })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    sessionId: data.id,
    botLink: `https://t.me/${botUsername}?start=${data.id}`,
  });
}
