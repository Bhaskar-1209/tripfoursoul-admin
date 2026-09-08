import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getNextSortOrder } from '@/lib/sortOrder';

export const dynamic = 'force-dynamic';

// GET - Fetch all testimonials
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const testimonials = await db.query('SELECT * FROM testimonials WHERE is_active = $1 OR $2 = true', [true, all]);
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

    const testimonialSort = Number(sort_order) > 0 ? Number(sort_order) : await getNextSortOrder('testimonials');
    if (testimonialSort > 0) {
      const duplicates = await db.query('SELECT id FROM testimonials WHERE sort_order = $1 AND is_active = true', [testimonialSort]);
      if (duplicates.length > 0) {
        return NextResponse.json({ error: `Sort number ${testimonialSort} is already used by another published testimonial. Unpublish that testimonial or choose a different number.` }, { status: 400 });
      }
    }

    const testimonial = await db.insert('testimonials', {
      name, image_url, rating: rating || 5, review,
      video_url: video_url || null,
      influencer_video_url: influencer_video_url || null,
      sort_order: testimonialSort, is_active: true
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

    const nextActive = is_active !== undefined ? Boolean(is_active) : true;
    const nextSortOrder = nextActive ? (Number(sort_order) || 0) : null;

    if (nextActive && nextSortOrder > 0) {
      const duplicates = await db.query('SELECT id FROM testimonials WHERE sort_order = $1 AND is_active = true AND id != $2', [nextSortOrder, Number(id)]);
      if (duplicates.length > 0) {
        return NextResponse.json({ error: `Sort number ${nextSortOrder} is already used by another published testimonial. Unpublish that testimonial or choose a different number.` }, { status: 400 });
      }
    }

    await db.update('testimonials', id, { name, image_url, rating, review, is_active, sort_order: nextSortOrder, video_url: video_url || null, influencer_video_url: influencer_video_url || null });

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
