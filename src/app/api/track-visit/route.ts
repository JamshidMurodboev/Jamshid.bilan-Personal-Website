import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VISITOR_COOKIE = 'visitor_id';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pagePath: string | undefined = body?.page_path;

    if (!pagePath || typeof pagePath !== 'string') {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
    let isNewVisitorId = false;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitorId = true;
    }

    const { error } = await supabaseAdmin.from('page_views').insert({
      page_path: pagePath,
      visitor_id: visitorId,
    });

    const response = NextResponse.json({ ok: !error });

    if (isNewVisitorId) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        maxAge: ONE_YEAR_SECONDS,
        path: '/',
        httpOnly: false,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
