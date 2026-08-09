import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const [{ count: totalPageViews }, { data: visitorRows }, { data: pathRows }] =
      await Promise.all([
        supabaseAdmin.from('page_views').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('page_views').select('visitor_id'),
        supabaseAdmin.from('page_views').select('page_path'),
      ]);

    const uniqueVisitors = new Set((visitorRows ?? []).map((r) => r.visitor_id)).size;

    const pathCounts: Record<string, number> = {};
    for (const row of pathRows ?? []) {
      const path = (row as { page_path: string }).page_path;
      pathCounts[path] = (pathCounts[path] ?? 0) + 1;
    }
    const topPages = Object.entries(pathCounts)
      .map(([page_path, count]) => ({ page_path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalPageViews: totalPageViews ?? 0,
      uniqueVisitors,
      topPages,
    });
  } catch {
    return NextResponse.json(
      { totalPageViews: 0, uniqueVisitors: 0, topPages: [] },
      { status: 200 }
    );
  }
}
