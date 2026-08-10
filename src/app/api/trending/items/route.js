import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const items = await db.query('SELECT * FROM trending_items ORDER BY sort_order ASC');
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, image_url, region, price, badge, sort_order } = await request.json();
    const result = await db.insert('trending_items', {
      name, image_url, region: region || '', price: price || '', badge: badge || '',
      sort_order: sort_order || 0, is_active: true
    });
    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, image_url, region, price, badge, sort_order, is_active } = await request.json();
    await db.update('trending_items', Number(id), {
      name, image_url, region, price, badge, sort_order, is_active
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await db.delete('trending_items', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}