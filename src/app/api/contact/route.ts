import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const schema = z.object({
  name: z.string().min(1),
  dob: z.string().optional(),
  certificate: z.string().optional(),
  score: z.string().optional(),
  target: z.string().min(1),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const { error } = await supabaseAdmin.from('inquiries').insert({
      name: data.name,
      phone: '',
      source: 'contact_form',
      status: 'new',
      locale: data.locale || 'uz',
      dob: data.dob || null,
      language_certificate: data.certificate || null,
      grant_interest: data.target,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
