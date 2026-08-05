import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const banners = db.query('page_banners', {});
    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { page_key, heading, subheading, image_url, is_active } = body;
    
    // Check if banner exists for this page
    const existing = db.query('page_banners', { page_key });
    if (existing.length > 0) {
      db.update('page_banners', existing[0].id, { heading, subheading, image_url, is_active: is_active !== undefined ? is_active : 1 });
      return NextResponse.json({ success: true, message: 'Banner updated successfully' });
    }
    
    db.insert('page_banners', { page_key, heading, subheading, image_url, is_active: is_active !== undefined ? is_active : 1 });
    return NextResponse.json({ success: true, message: 'Banner created successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, heading, subheading, image_url, is_active } = body;
    db.update('page_banners', id, { heading, subheading, image_url, is_active });
    return NextResponse.json({ success: true, message: 'Banner updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}