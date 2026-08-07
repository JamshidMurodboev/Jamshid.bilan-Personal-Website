import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const { email: rawEmail, name } = parsed.data;
  const email = rawEmail.trim().toLowerCase();

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return NextResponse.json({ error: 'Email service not configured (missing RESEND_API_KEY)' }, { status: 500 });
  }

  // Rate limiting: check if a token was created in the last 60 seconds
  const cooldownThreshold = new Date(Date.now() - 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('verification_tokens')
    .select('id')
    .eq('email', email)
    .gte('created_at', cooldownThreshold)
    .maybeSingle();

  if (recent) {
    return NextResponse.json(
      { error: 'Please wait 60 seconds before requesting another code' },
      { status: 429 }
    );
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await supabase.from('verification_tokens').delete().eq('email', email);

  const { error: insertError } = await supabase
    .from('verification_tokens')
    .insert({ email, code, expires_at: expiresAt, created_at: new Date().toISOString() });

  if (insertError) {
    console.error('Supabase insert error:', insertError);
    return NextResponse.json({ error: 'Failed to save token' }, { status: 500 });
  }

  const safeName = esc(name || 'Foydalanuvchi');
  const safeCode = esc(code);

  const { error: emailError } = await resend.emails.send({
    from: 'Jamshid.bilan <onboarding@resend.dev>',
    to: email,
    subject: "Ro'yxatdan o'tishni tasdiqlang — Jamshid.bilan",
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f766e; margin-bottom: 8px;">Salom, ${safeName}!</h2>
        <p style="color: #374151;">Ro'yxatdan o'tishni tasdiqlash uchun quyidagi kodni kiriting:</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #0f766e; text-align: center; padding: 24px 0; background: #f0fdfa; border-radius: 12px; margin: 16px 0;">${safeCode}</div>
        <p style="color: #6b7280; font-size: 13px;">Kod 30 daqiqa davomida amal qiladi. Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
      </div>
    `,
  });

  if (emailError) {
    console.error('Resend error:', emailError);
    return NextResponse.json({ error: `Failed to send email: ${(emailError as any).message || JSON.stringify(emailError)}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
