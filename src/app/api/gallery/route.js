import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const images = await db.query('SELECT * FROM gallery_images ORDER BY sort_order ASC, id DESC');
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { image_url, video_url, media_type, title, category, sort_order, is_active } = body;
    if (!(image_url || video_url)) return NextResponse.json({ error: 'An image or video URL is required' }, { status: 400 });
    const img = await db.insert('gallery_images', {
      image_url: image_url || '', video_url: video_url || '', media_type: media_type || (video_url ? 'video' : 'image'),
      title: title || '', category: category || 'General', sort_order: Number(sort_order) || 0,
      is_active: is_active !== undefined ? is_active : true
    });
    return NextResponse.json({ success: true, id: img.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Gallery item ID required' }, { status: 400 });
    await db.update('gallery_images', id, data);
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
