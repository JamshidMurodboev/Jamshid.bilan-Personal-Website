import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_ATTEMPTS = 10;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { email: rawEmail, code: rawCode } = await req.json();
  if (!rawEmail || !rawCode) {
    return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
  }
  const email = rawEmail.trim().toLowerCase();
  const code = rawCode.trim();

  const { data, error } = await supabase
    .from('verification_tokens')
    .select('*')
    .eq('email', email)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  const attempts = (data.attempts as number) || 0;

  // Too many wrong attempts — invalidate
  if (attempts >= MAX_ATTEMPTS) {
    await supabase.from('verification_tokens').delete().eq('id', data.id);
    return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 });
  }

  if (data.code !== code) {
    // Increment attempt counter
    await supabase
      .from('verification_tokens')
      .update({ attempts: attempts + 1 })
      .eq('id', data.id);
    const remaining = MAX_ATTEMPTS - attempts - 1;
    return NextResponse.json({ error: `Invalid code. ${remaining} attempts remaining.` }, { status: 400 });
  }

  await supabase.from('verification_tokens').delete().eq('id', data.id);

  return NextResponse.json({ success: true });
}
