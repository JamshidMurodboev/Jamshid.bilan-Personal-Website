import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    .eq('code', code)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  await supabase.from('verification_tokens').delete().eq('id', data.id);

  return NextResponse.json({ success: true });
}
