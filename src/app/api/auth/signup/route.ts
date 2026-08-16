import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { phone, password, fullName, dob, gender, photoUrl } = await req.json();
  if (!phone || !password || !fullName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const email = phone.replace(/\D/g, '') + '@jamshid.bilan';

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
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

  const { error: upsertError } = await supabaseAdmin.from('site_users').upsert({
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

  if (upsertError) {
    // Roll back: remove the auth user so they can retry registration
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: 'Profil yaratishda xatolik: ' + upsertError.message }, { status: 500 });
  }

  // Sign in immediately to get tokens for the client
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

  const tokenData = tokenRes.ok ? await tokenRes.json() : null;

  return NextResponse.json({
    success: true,
    userId,
    accessToken: tokenData?.access_token || null,
    refreshToken: tokenData?.refresh_token || null,
    user: {
      id: userId,
      email,
      fullName,
      dob: dob || '',
      gender: gender || '',
      phone,
      photoUrl: photoUrl || null,
      languageCertificate: null,
    },
  });
}
