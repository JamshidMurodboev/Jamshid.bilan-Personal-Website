import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Verify the caller is authenticated and can only update their own profile
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  let authenticatedUserId: string | null = null;

  if (token) {
    // Verify via JWT token if provided
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    authenticatedUserId = user?.id ?? null;
  } else {
    // Fallback: check server-side Supabase session cookie
    try {
      const supabase = createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id ?? null;
    } catch {}
  }

  const { userId, email, fullName, dob, gender, phone, languageCertificate } = await req.json();
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  // Enforce that the caller can only update their own profile
  if (!authenticatedUserId || authenticatedUserId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates: Record<string, unknown> = {};
  if (email !== undefined) updates.email = email;
  if (fullName !== undefined) updates.full_name = fullName;
  if (dob !== undefined) updates.dob = dob;
  if (gender !== undefined) updates.gender = gender;
  if (phone !== undefined) updates.phone = phone;
  if (languageCertificate !== undefined) {
    updates.language_certificate = languageCertificate
      ? `${languageCertificate.type}:${languageCertificate.score}`
      : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabaseAdmin
    .from('site_users')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
