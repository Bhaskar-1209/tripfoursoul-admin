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
    travel_start_date DATE,
    travel_end_date DATE,
    duration_days INTEGER,
    duration TEXT,
    publish_duration_days INTEGER,
    published_until TIMESTAMP,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => db.query(`
  ALTER TABLE offers
    ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100) DEFAULT '',
    ADD COLUMN IF NOT EXISTS travel_start_date DATE,
    ADD COLUMN IF NOT EXISTS travel_end_date DATE,
    ADD COLUMN IF NOT EXISTS duration_days INTEGER,
    ADD COLUMN IF NOT EXISTS duration TEXT,
    ADD COLUMN IF NOT EXISTS publish_duration_days INTEGER,
    ADD COLUMN IF NOT EXISTS published_until TIMESTAMP
`));

const validDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(String(date || '').trim()) ? String(date).trim() : null;
const validDurationDays = (days) => {
  const value = String(days ?? '').trim();
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
};

const publishExpiry = (days) => {
  if (!days) return null;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
};

const isOfferPublic = (offer) => Boolean(offer.is_active) && (!offer.published_until || new Date(offer.published_until).getTime() > Date.now());

const normalizeOffer = (offer = {}) => ({
  title: String(offer.title || '').trim(),
  description: String(offer.description || '').trim(),
  image_url: String(offer.image_url || '').trim(),
  button_text: String(offer.button_text || 'Explore offer').trim(),
  button_link: String(offer.button_link || '/contact').trim(),
  badge: String(offer.badge || '').trim(),
  coupon_code: String(offer.coupon_code || '').trim().toUpperCase(),
  travel_start_date: validDate(offer.travel_start_date),
  travel_end_date: validDate(offer.travel_end_date),
  duration_days: validDurationDays(offer.duration_days),
  duration: String(offer.duration || '').trim() || null,
  publish_duration_days: validDurationDays(offer.publish_duration_days),
  sort_order: Number(offer.sort_order) || 0,
  is_active: offer.is_active !== undefined ? Boolean(offer.is_active) : true,
});

export async function GET(request) {
  try {
    await ensureOffersTable();
    const showAll = new URL(request.url).searchParams.get('all') === 'true';
    const offers = await db.query('SELECT * FROM offers ORDER BY sort_order ASC, id DESC');
    return NextResponse.json({ offers: showAll ? offers : offers.filter(isOfferPublic) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureOffersTable();
    const offer = normalizeOffer(await request.json());
    if (!offer.title) return NextResponse.json({ error: 'Offer title is required' }, { status: 400 });
    offer.published_until = publishExpiry(offer.publish_duration_days);
    return NextResponse.json({ offer: await db.insert('offers', offer) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await ensureOffersTable();
    const { id, reset_publish_expiry, ...body } = await request.json();
    if (!id) return NextResponse.json({ error: 'Offer id is required' }, { status: 400 });
    const offer = normalizeOffer(body);
    if (!offer.title) return NextResponse.json({ error: 'Offer title is required' }, { status: 400 });
    const existing = await db.get('offers', Number(id));
    if (!existing) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    if (reset_publish_expiry) {
      offer.published_until = publishExpiry(offer.publish_duration_days);
    } else {
      offer.publish_duration_days = existing.publish_duration_days || null;
      offer.published_until = existing.published_until || null;
    }
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
