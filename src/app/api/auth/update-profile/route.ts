import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, fullName, dob, gender, phone, languageCertificate } = await req.json();
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const updates: Record<string, unknown> = {};
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
    .update(updates)
    .eq('id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
