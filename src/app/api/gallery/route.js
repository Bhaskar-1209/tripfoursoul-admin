import { NextResponse } from 'next/server';
import db from '@/lib/db';

const normalizeActive = (value) => value === true || value === 1 || value === '1' || value === 'true';

export async function GET(request) {
  try {
    const publicOnly = new URL(request.url).searchParams.get('public') === 'true';
    const images = await db.query(
      publicOnly
        ? 'SELECT * FROM gallery_images WHERE is_active = true ORDER BY sort_order ASC, id DESC'
        : 'SELECT * FROM gallery_images ORDER BY sort_order ASC, id DESC'
    );
    return NextResponse.json({ images: images.map((image) => ({ ...image, is_active: normalizeActive(image.is_active) })) });
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
      is_active: is_active !== undefined ? normalizeActive(is_active) : true
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
    if (data.is_active !== undefined) data.is_active = normalizeActive(data.is_active);
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
