import { NextResponse } from 'next/server';

export async function POST() {
  // Session is stored in localStorage (client-side), nothing to clear server-side
  return NextResponse.json({ success: true });
}
