import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email: rawEmail, name } = await req.json();
  if (!rawEmail) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  const email = rawEmail.trim().toLowerCase();

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return NextResponse.json({ error: 'Email service not configured (missing RESEND_API_KEY)' }, { status: 500 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await supabase.from('verification_tokens').delete().eq('email', email);

  const { error: insertError } = await supabase
    .from('verification_tokens')
    .insert({ email, code, expires_at: expiresAt });

  if (insertError) {
    console.error('Supabase insert error:', insertError);
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }

  const { error: emailError } = await resend.emails.send({
    from: 'Jamshid.bilan <onboarding@resend.dev>',
    to: email,
    subject: "Ro'yxatdan o'tishni tasdiqlang — Jamshid.bilan",
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f766e; margin-bottom: 8px;">Salom, ${name}!</h2>
        <p style="color: #374151;">Ro'yxatdan o'tishni tasdiqlash uchun quyidagi kodni kiriting:</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #0f766e; text-align: center; padding: 24px 0; background: #f0fdfa; border-radius: 12px; margin: 16px 0;">${code}</div>
        <p style="color: #6b7280; font-size: 13px;">Kod 30 daqiqa davomida amal qiladi. Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
      </div>
    `,
  });

  if (emailError) {
    console.error('Resend error:', emailError);
    return NextResponse.json({ error: `Failed to send email: ${emailError.message || JSON.stringify(emailError)}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
