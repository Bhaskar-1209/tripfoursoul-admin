import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const pricing = await db.query('SELECT * FROM region_pricing WHERE is_active = true');
    pricing.sort((a, b) => a.region.localeCompare(b.region));
    return NextResponse.json({ pricing });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { region, starting_price, currency, usd_price, is_active } = await request.json();
    const existing = await db.query('SELECT * FROM region_pricing WHERE region = $1 AND currency = $2', [region, currency]);
    const item = existing[0]
      ? await db.update('region_pricing', existing[0].id, { starting_price, currency, usd_price, is_active: is_active || true })
      : await db.insert('region_pricing', { region, starting_price, currency, usd_price, is_active: is_active || true });
    return NextResponse.json({ success: true, id: item.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, region, starting_price, currency, usd_price, is_active } = await request.json();
    await db.update('region_pricing', id, { region, starting_price, currency, usd_price, is_active });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await db.delete('region_pricing', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}