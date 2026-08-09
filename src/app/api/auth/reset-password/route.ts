import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { phone, sessionId, newPassword } = await req.json();
  if (!phone || !sessionId || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // NOTE: telegram_otp_sessions stores phone in the 'email' column (no phone column yet)
  const { data: session } = await supabase
    .from('telegram_otp_sessions')
    .select('status, purpose, email')
    .eq('id', sessionId)
    .single();

  if (!session || session.status !== 'verified' || session.purpose !== 'reset') {
    return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
  }

  // Compare digits only to handle formatting differences
  if ((session.email || '').replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
    return NextResponse.json({ error: 'Phone mismatch' }, { status: 403 });
  }

  // Build synthetic email from phone to look up the auth user
  const syntheticEmail = phone.replace(/\D/g, '') + '@jamshid.bilan';

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  let user = users?.find((u: { email?: string; id: string }) => u.email === syntheticEmail);
  if (!user) {
    // Fallback: look up via site_users phone column
    const { data: siteUser } = await supabase.from('site_users').select('id').eq('phone', phone).single();
    if (siteUser?.id) {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(siteUser.id);
      user = authUser ?? undefined;
    }
  }
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { error } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword, email_confirm: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('telegram_otp_sessions').update({ status: 'used' }).eq('id', sessionId);

  return NextResponse.json({ success: true });
}
