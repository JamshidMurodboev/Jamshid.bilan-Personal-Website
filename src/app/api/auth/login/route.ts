import { NextRequest, NextResponse } from 'next/server';

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

  return NextResponse.json({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: tokenData.expires_at,
    user: tokenData.user,
  });
}
