import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_logged_in');
  const authenticated = !!adminCookie?.value;
  const email = authenticated ? adminCookie!.value : null;

  return NextResponse.json({ authenticated, email });
}
