import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await db.query('SELECT * FROM trending_settings ORDER BY id ASC LIMIT 1');
    const items = await db.query('SELECT * FROM trending_items WHERE is_active = true');
    items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ settings: settings[0] || null, items });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { heading, subtitle, is_enabled } = await request.json();
    const settings = await db.query('SELECT * FROM trending_settings ORDER BY id ASC LIMIT 1');
    if (settings.length > 0) {
      const updated = await db.update('trending_settings', settings[0].id, {
        heading,
        subtitle,
        is_enabled: is_enabled !== undefined ? Boolean(is_enabled) : settings[0].is_enabled,
      });
      return NextResponse.json({ success: true, settings: updated });
    }
    return NextResponse.json({ success: false, error: 'Trending settings record not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
