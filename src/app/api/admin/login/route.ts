import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

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

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || "Email yoki parol noto'g'ri" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, email: data.user?.email ?? null });

  cookiesToApply.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  // Simple session cookie checked by /api/admin/session
  response.cookies.set('admin_logged_in', data.user?.email ?? '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
