import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const images = db.query('banner_images', {}).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { image_url, sort_order } = await request.json();
    const image = db.insert('banner_images', { image_url, sort_order: sort_order || 0, is_active: 1 });
    return NextResponse.json({ success: true, id: image.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    db.delete('banner_images', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
