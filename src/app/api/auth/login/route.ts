import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    return NextResponse.json(
      { error: "Telefon raqam yoki parol noto'g'ri" },
      { status: 401 }
    );
  }

  const { data: profile } = await supabaseAdmin
    .from('site_users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const response = NextResponse.json({
    success: true,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: profile?.full_name || '',
      dob: profile?.dob || '',
      gender: profile?.gender || '',
      phone: profile?.phone || '',
      photoUrl: profile?.photo_url || null,
      languageCertificate: profile?.language_certificate || null,
    },
  });

  cookiesToApply.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  return response;
}
