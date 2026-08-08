import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session');
  if (!sessionId) return NextResponse.json({ error: 'Missing session' }, { status: 400 });

  const { data, error } = await supabase
    .from('telegram_otp_sessions')
    .select('status, expires_at')
    .eq('id', sessionId)
    .single();

  if (error || !data) return NextResponse.json({ status: 'not_found' });

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ status: 'expired' });
  }

  return NextResponse.json({ status: data.status });
}
