import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, currentPassword, newPassword } = await req.json();
  if (!email || !currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" }, { status: 400 });
  }

  // Verify current password by attempting a sign-in
  const tokenRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
      body: JSON.stringify({ email, password: currentPassword }),
    }
  );
  if (!tokenRes.ok) return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 401 });

  const tokenData = await tokenRes.json();
  const userId = tokenData.user?.id;
  if (!userId) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

  // Update password directly using the verified user ID (no listUsers needed)
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });

  return NextResponse.json({ success: true });
}
