import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('admin_logged_in')?.value;
  if (!adminCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [{ count: totalPageViews }, { data: uniqueData }, { data: topData }] =
      await Promise.all([
        supabaseAdmin.from('page_views').select('*', { count: 'exact', head: true }),
        supabaseAdmin.rpc('count_unique_visitors'),
        supabaseAdmin.rpc('top_pages', { limit_count: 5 }),
      ]);

    // Fallback: if RPCs don't exist, fetch with server-side aggregation on a limited set
    let uniqueVisitors = uniqueData ?? 0;
    let topPages = topData ?? [];

    if (uniqueData === null || !Array.isArray(topData)) {
      const [{ data: visitorRows }, { data: pathRows }] = await Promise.all([
        supabaseAdmin.from('page_views').select('visitor_id').limit(10000),
        supabaseAdmin.from('page_views').select('page_path').limit(10000),
      ]);
      uniqueVisitors = new Set((visitorRows ?? []).map((r) => r.visitor_id)).size;
      const pathCounts: Record<string, number> = {};
      for (const row of pathRows ?? []) {
        const path = (row as { page_path: string }).page_path;
        pathCounts[path] = (pathCounts[path] ?? 0) + 1;
      }
      topPages = Object.entries(pathCounts)
        .map(([page_path, count]) => ({ page_path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

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
