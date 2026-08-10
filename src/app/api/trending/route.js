import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.query('SELECT * FROM trending_settings LIMIT 1');
    const items = await db.query('SELECT * FROM trending_items WHERE is_active = true');
    items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ settings: settings[0] || null, items });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { heading, subtitle } = await request.json();
    const settings = await db.query('SELECT * FROM trending_settings LIMIT 1');
    if (settings.length > 0) {
      await db.update('trending_settings', settings[0].id, { heading, subtitle });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
