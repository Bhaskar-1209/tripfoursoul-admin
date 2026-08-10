import { NextResponse } from 'next/server';
import db from '@/lib/db';

const ensureOffersTable = () => db.query(`
  CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    image_url VARCHAR(500) DEFAULT '',
    button_text VARCHAR(100) DEFAULT 'Explore offer',
    button_link VARCHAR(500) DEFAULT '/contact',
    badge VARCHAR(100) DEFAULT '',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

const normalizeOffer = (offer = {}) => ({
  title: String(offer.title || '').trim(),
  description: String(offer.description || '').trim(),
  image_url: String(offer.image_url || '').trim(),
  button_text: String(offer.button_text || 'Explore offer').trim(),
  button_link: String(offer.button_link || '/contact').trim(),
  badge: String(offer.badge || '').trim(),
  sort_order: Number(offer.sort_order) || 0,
  is_active: offer.is_active !== undefined ? Boolean(offer.is_active) : true,
});

export async function GET(request) {
  try {
    await ensureOffersTable();
    const showAll = new URL(request.url).searchParams.get('all') === 'true';
    const offers = await db.query(`SELECT * FROM offers${showAll ? '' : ' WHERE is_active = true'} ORDER BY sort_order ASC, id DESC`);
    return NextResponse.json({ offers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureOffersTable();
    const offer = normalizeOffer(await request.json());
    if (!offer.title) return NextResponse.json({ error: 'Offer title is required' }, { status: 400 });
    return NextResponse.json({ offer: await db.insert('offers', offer) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await ensureOffersTable();
    const { id, ...body } = await request.json();
    if (!id) return NextResponse.json({ error: 'Offer id is required' }, { status: 400 });
    const offer = normalizeOffer(body);
    if (!offer.title) return NextResponse.json({ error: 'Offer title is required' }, { status: 400 });
    return NextResponse.json({ offer: await db.update('offers', Number(id), offer) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await ensureOffersTable();
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Offer id is required' }, { status: 400 });
    await db.delete('offers', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
