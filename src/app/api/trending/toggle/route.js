import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request) {
  try {
    const { is_enabled } = await request.json();
    const settings = db.query('trending_settings', {})[0];
    if (settings) db.update('trending_settings', settings.id, { is_enabled: Number(is_enabled) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
