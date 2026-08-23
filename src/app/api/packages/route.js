import { NextResponse } from 'next/server';
import db from '@/lib/db';

const makeSlug = (value = '') => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destination_id');
    let packages = await db.query('SELECT * FROM packages WHERE is_active = true');

    if (destinationId) {
      packages = packages.filter((item) => item.destination_id === Number(destinationId));
    }

    const destinations = await db.query('SELECT * FROM destinations');
    const destinationNames = new Map(destinations.map((item) => [item.id, item.name]));
    packages = packages
      .map((item) => ({ ...item, destination_name: destinationNames.get(item.destination_id) || 'Unassigned' }))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return NextResponse.json({ packages });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination_id, title, days, meals, short_description, long_description, sub_heading, itinerary, additional_info, image_url, inclusives, exclusives, price, price_usd, price_inr, price_eur, sort_order = 0, is_trending = false, is_spiritual = false } = body;
    if (!destination_id || !title) {
      return NextResponse.json({ error: 'Destination and package title are required' }, { status: 400 });
    }
    const packageItem = await db.insert('packages', {
      destination_id: Number(destination_id), title, slug: makeSlug(title), days, meals,
      short_description, long_description, sub_heading, itinerary, additional_info, image_url,
      inclusives, exclusives, price, price_usd, price_inr, price_eur, sort_order: Number(sort_order), is_trending: Boolean(is_trending), is_spiritual: Boolean(is_spiritual), is_active: true,
    });
    return NextResponse.json({ success: true, id: packageItem.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, destination_id, title, days, meals, short_description, long_description, sub_heading, itinerary, additional_info, image_url, inclusives, exclusives, price, price_usd, price_inr, price_eur, sort_order = 0, is_trending = false, is_spiritual = false } = body;
    if (!id || !destination_id || !title) {
      return NextResponse.json({ error: 'Package ID, destination and title are required' }, { status: 400 });
    }
    const updated = await db.update('packages', Number(id), {
      destination_id: Number(destination_id), title, slug: makeSlug(title), days, meals,
      short_description, long_description, sub_heading, itinerary, additional_info, image_url,
      inclusives, exclusives, price, price_usd, price_inr, price_eur, sort_order: Number(sort_order), is_trending: Boolean(is_trending), is_spiritual: Boolean(is_spiritual), is_active: true,
    });
    if (!updated) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    await db.delete('packages', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}