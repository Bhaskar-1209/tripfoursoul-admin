import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const images = await db.query('SELECT * FROM gallery_images WHERE is_active = 1');
    // Randomize order for display
    images.sort(() => Math.random() - 0.5);
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { image_url, title, is_active } = body;
    const img = await db.insert('gallery_images', { image_url, title: title || '', is_active: is_active !== undefined ? is_active : 1 });
    return NextResponse.json({ success: true, id: img.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, image_url, title, is_active } = body;
    await db.update('gallery_images', id, { image_url, title, is_active });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await db.delete('gallery_images', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
