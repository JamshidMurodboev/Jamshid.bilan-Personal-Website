import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json();
  if (!phone || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const email = phone.replace(/\D/g, '') + '@jamshid.bilan';

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

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: "Telefon raqam yoki parol noto'g'ri" },
      { status: 401 }
    );
  }

  const userId = tokenData.user?.id;
  const { data: profile } = await supabaseAdmin
    .from('site_users')
    .select('*')
    .eq('id', userId)
    .single();

  return NextResponse.json({
    success: true,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    user: {
      id: userId,
      email: tokenData.user?.email,
      fullName: profile?.full_name || '',
      dob: profile?.dob || '',
      gender: profile?.gender || '',
      phone: profile?.phone || '',
      photoUrl: profile?.photo_url || null,
      languageCertificate: profile?.language_certificate || null,
    },
  });
}
