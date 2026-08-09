import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json();
  if (!phone || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const email = phone.replace(/\D/g, '') + '@jamshid.bilan';

  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json(
      { error: "Telefon raqam yoki parol noto'g'ri" },
      { status: 401 }
    );
  }

  return response;
}
