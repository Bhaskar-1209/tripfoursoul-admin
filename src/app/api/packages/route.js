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
    const {
      id, destination_id, title, days, meals, short_description, long_description, sub_heading, itinerary, additional_info, image_url, inclusives, exclusives,
      price, price_usd, price_inr, price_eur, is_active, sort_order, is_trending, is_spiritual,
    } = body;
    if (!id || !destination_id || !title) {
      return NextResponse.json({ error: 'Package ID, destination and title are required' }, { status: 400 });
    }
    const existing = await db.get('packages', Number(id));
    if (!existing) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    const updated = await db.update('packages', Number(id), {
      destination_id: destination_id !== undefined ? Number(destination_id) : existing.destination_id,
      title: title !== undefined ? title : existing.title,
      slug: makeSlug(title !== undefined ? title : existing.title),
      days: days !== undefined ? days : existing.days,
      meals: meals !== undefined ? meals : existing.meals,
      short_description: short_description !== undefined ? short_description : existing.short_description,
      long_description: long_description !== undefined ? long_description : existing.long_description,
      sub_heading: sub_heading !== undefined ? sub_heading : existing.sub_heading,
      itinerary: itinerary !== undefined ? itinerary : existing.itinerary,
      additional_info: additional_info !== undefined ? additional_info : existing.additional_info,
      image_url: image_url !== undefined ? image_url : existing.image_url,
      inclusives: inclusives !== undefined ? inclusives : existing.inclusives,
      exclusives: exclusives !== undefined ? exclusives : existing.exclusives,
      price: price !== undefined ? price : existing.price,
      price_usd: price_usd !== undefined ? price_usd : existing.price_usd,
      price_inr: price_inr !== undefined ? price_inr : existing.price_inr,
      price_eur: price_eur !== undefined ? price_eur : existing.price_eur,
      sort_order: sort_order !== undefined ? Number(sort_order) : existing.sort_order,
      is_trending: is_trending !== undefined ? Boolean(is_trending) : existing.is_trending,
      is_spiritual: is_spiritual !== undefined ? Boolean(is_spiritual) : existing.is_spiritual,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : existing.is_active,
    });
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