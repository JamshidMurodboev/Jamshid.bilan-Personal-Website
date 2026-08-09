import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { phone, password, fullName, dob, gender, photoUrl } = await req.json();
  if (!phone || !password || !fullName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Build synthetic email from phone digits only (e.g. +998-91-234-56-78 → 998912345678@jamshid.bilan)
  const email = phone.replace(/\D/g, '') + '@jamshid.bilan';

  // Create user via admin API — bypasses email confirmation requirement
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already registered')) {
      return NextResponse.json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (!userId) return NextResponse.json({ error: 'User creation failed' }, { status: 500 });

  await supabase.from('site_users').upsert({
    id: userId,
    full_name: fullName,
    email,
    phone: phone,
    gender: gender || null,
    dob: dob || null,
    photo_url: photoUrl || null,
    created_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
    login_count: 1,
    status: 'active',
  }, { onConflict: 'id' });

  // Sign in server-side and return tokens so client can call setSession()
  // This avoids any client-side signInWithPassword hang/failure issues
  const tokenRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password }),
    }
  );
  const tokenData = await tokenRes.json();
  const tokens = tokenRes.ok ? {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: tokenData.expires_at,
  } : null;

  return NextResponse.json({ success: true, userId, tokens });
}
