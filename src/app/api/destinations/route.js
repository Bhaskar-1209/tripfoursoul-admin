import { NextResponse } from 'next/server';
import db from '@/lib/db';

const makeSlug = (value = '') => String(value).trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

// GET - Fetch all destinations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');

    const all = searchParams.get('all') === 'true';
    let destinations = await db.query('SELECT * FROM destinations WHERE is_active = $1 OR $2 = true', [true, all]);

    if (region && region !== 'all') {
      destinations = destinations.filter(d => d.region === region);
    }

    // Sort by sort_order and created_at
    destinations.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return NextResponse.json({ destinations });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new destination
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, image_url, region, price, description, is_trending = false } = body;

    const newDestination = await db.insert('destinations', {
      name,
      slug: makeSlug(name),
      image_url,
      region,
      price,
      description,
      is_trending: Boolean(is_trending),
      is_active: true,
      sort_order: 0
    });

    return NextResponse.json({
      success: true,
      id: newDestination.id,
      message: 'Destination created successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update destination
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, image_url, region, price, description, is_active, sort_order, is_trending = false } = body;

    const updated = await db.update('destinations', id, {
      name,
      slug: makeSlug(name),
      image_url,
      region,
      price,
      description,
      is_trending: Boolean(is_trending),
      is_active,
      sort_order
    });

    if (updated) {
      return NextResponse.json({ success: true, message: 'Destination updated successfully' });
    } else {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete destination
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ error: 'Destination ID required' }, { status: 400 });
    }

    await db.delete('destinations', id);

    return NextResponse.json({ success: true, message: 'Destination deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
