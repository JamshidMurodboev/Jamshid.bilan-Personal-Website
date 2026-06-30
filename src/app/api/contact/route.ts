import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.enum(['scholarship', 'university', 'general']),
  message: z.string().min(10),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const supabase = await createClient();
    await supabase.from('inquiries').insert({
      name: data.full_name,
      phone: data.phone || '',
      email: data.email,
      message: data.message,
      source: 'contact_form',
      status: 'new',
      locale: data.locale || 'uz',
      grant_interest: data.subject,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
