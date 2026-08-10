import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request) {
  try {
    const { is_enabled } = await request.json();
    const settings = await db.query('SELECT * FROM trending_settings LIMIT 1');
    if (settings.length > 0) await db.update('trending_settings', settings[0].id, { is_enabled: Boolean(is_enabled) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}