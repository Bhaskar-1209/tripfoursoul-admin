import { NextResponse } from 'next/server';
import db from '@/lib/db';

const TABLES = new Set([
  'banner_images', 'blog_categories', 'destinations', 'features', 'gallery_images',
  'offers', 'packages', 'services', 'team_members', 'testimonials', 'trending_items',
]);

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const table = new URL(request.url).searchParams.get('table');
  if (!TABLES.has(table)) return NextResponse.json({ error: 'Unsupported sort list' }, { status: 400 });
  try {
    const rows = await db.query(`SELECT sort_order FROM ${table} WHERE sort_order > 0 AND is_active = true`);
    const used = new Set(rows.map((row) => Number(row.sort_order)).filter((value) => Number.isInteger(value) && value > 0));
    let next = 1;
    while (used.has(next)) next += 1;
    return NextResponse.json({ nextSortOrder: next });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
