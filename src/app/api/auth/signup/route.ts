import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

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

  await supabaseAdmin.from('site_users').upsert({
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

  const cookiesToApply: { name: string; value: string; options?: object }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToApply.push(...cookiesToSet);
        },
      },
    }
  );

  await supabase.auth.signInWithPassword({ email, password });

  const response = NextResponse.json({
    success: true,
    userId,
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

  cookiesToApply.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  return response;
}
