import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const banners = await db.query('SELECT * FROM page_banners');
    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { page_key, heading, subheading, background_image, image_url, is_active } = body;
    // Support both field names: background_image (correct) and image_url (legacy)
    const bgImage = background_image || image_url || '';
    
    // Check if banner exists for this page
    const existing = await db.query('SELECT * FROM page_banners WHERE page_key = $1', [page_key]);
    if (existing.length > 0) {
      await db.update('page_banners', existing[0].id, { heading, subheading, background_image: bgImage, is_active: is_active !== undefined ? is_active : true });
      return NextResponse.json({ success: true, message: 'Banner updated successfully' });
    }
    
    await db.insert('page_banners', { page_key, heading, subheading, background_image: bgImage, is_active: is_active !== undefined ? is_active : true });
    return NextResponse.json({ success: true, message: 'Banner created successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, heading, subheading, background_image, image_url, is_active } = body;
    const bgImage = background_image || image_url || '';
    await db.update('page_banners', id, { heading, subheading, background_image: bgImage, is_active });
    return NextResponse.json({ success: true, message: 'Banner updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
