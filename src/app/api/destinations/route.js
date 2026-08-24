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
    const { name, image_url, region, price, price_usd, price_inr, price_eur, description, is_trending = false, is_spiritual = false } = body;

    const newDestination = await db.insert('destinations', {
      name,
      slug: makeSlug(name),
      image_url,
      region,
      price,
      price_usd,
      price_inr,
      price_eur,
      description,
      is_trending: Boolean(is_trending),
      is_spiritual: Boolean(is_spiritual),
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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, image_url, region, price, price_usd, price_inr, price_eur, description, is_active, sort_order, is_trending, is_spiritual } = body;

    const existing = await db.get('destinations', id);
    if (!existing) return NextResponse.json({ error: 'Destination not found' }, { status: 404 });

    const updated = await db.update('destinations', id, {
      name: name !== undefined ? name : existing.name,
      slug: makeSlug(name !== undefined ? name : existing.name),
      image_url: image_url !== undefined ? image_url : existing.image_url,
      region: region !== undefined ? region : existing.region,
      price: price !== undefined ? price : existing.price,
      price_usd: price_usd !== undefined ? price_usd : existing.price_usd,
      price_inr: price_inr !== undefined ? price_inr : existing.price_inr,
      price_eur: price_eur !== undefined ? price_eur : existing.price_eur,
      description: description !== undefined ? description : existing.description,
      is_trending: is_trending !== undefined ? Boolean(is_trending) : existing.is_trending,
      is_spiritual: is_spiritual !== undefined ? Boolean(is_spiritual) : existing.is_spiritual,
      is_active: is_active !== undefined ? Boolean(is_active) : existing.is_active,
      sort_order: sort_order !== undefined ? Number(sort_order) : existing.sort_order
    });

    return NextResponse.json({ success: true, message: 'Destination updated successfully' });
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
