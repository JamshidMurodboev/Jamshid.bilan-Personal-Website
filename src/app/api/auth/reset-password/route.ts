import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, sessionId, newPassword } = await req.json();
  if (!email || !sessionId || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: session } = await supabase
    .from('telegram_otp_sessions')
    .select('status, purpose, email')
    .eq('id', sessionId)
    .single();

  if (!session || session.status !== 'verified' || session.purpose !== 'reset') {
    return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
  }

  if (session.email !== email) {
    return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
  }

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  // Also try direct lookup in case listUsers pagination misses them
  let user = users?.find(u => u.email === email);
  if (!user) {
    // Try fetching via site_users to get the auth user id
    const { data: siteUser } = await supabase.from('site_users').select('id').eq('email', email).single();
    if (siteUser?.id) {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(siteUser.id);
      user = authUser ?? undefined;
    }
  }
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { error } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('telegram_otp_sessions').update({ status: 'used' }).eq('id', sessionId);

  return NextResponse.json({ success: true });
}
