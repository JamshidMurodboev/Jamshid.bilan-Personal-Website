import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { sessionId, otp } = await req.json();
  if (!sessionId || !otp) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data, error } = await supabase
    .from('telegram_otp_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (data.status === 'verified') return NextResponse.json({ error: 'Already used' }, { status: 400 });
  if (data.status !== 'linked') return NextResponse.json({ error: 'Not linked yet' }, { status: 400 });
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 400 });

  const attempts = (data.attempts || 0) + 1;
  if (attempts > 5) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });

  if (data.otp !== otp) {
    await supabase.from('telegram_otp_sessions').update({ attempts }).eq('id', sessionId);
    return NextResponse.json({ error: 'Wrong code', attemptsLeft: 5 - attempts }, { status: 400 });
  }

  await supabase.from('telegram_otp_sessions').update({ status: 'verified' }).eq('id', sessionId);

  if (data.purpose === 'reset' && data.email && data.chat_id) {
    await supabase.from('site_users').update({ telegram_chat_id: data.chat_id }).eq('email', data.email);
  }

  return NextResponse.json({ success: true, chatId: data.chat_id });
}
