import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all testimonials
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const testimonials = await db.query('SELECT * FROM testimonials WHERE is_active = ? OR ? = true', [1, all]);
    testimonials.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create testimonial
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, image_url, rating, review, sort_order, video_url, influencer_video_url } = body;
    
    const testimonial = await db.insert('testimonials', {
      name, image_url, rating: rating || 5, review,
      video_url: video_url || null,
      influencer_video_url: influencer_video_url || null,
      sort_order: sort_order || 0, is_active: 1
    });
    return NextResponse.json({ success: true, id: testimonial.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update testimonial
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, image_url, rating, review, is_active, sort_order, video_url, influencer_video_url } = body;
    
    await db.update('testimonials', id, { name, image_url, rating, review, is_active, sort_order, video_url: video_url || null, influencer_video_url: influencer_video_url || null });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete testimonial
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await db.delete('testimonials', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
