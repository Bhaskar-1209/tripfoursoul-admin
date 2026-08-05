import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [items] = await pool.query('SELECT * FROM trending_items ORDER BY sort_order ASC');
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, image_url, region, price, badge, sort_order } = await request.json();
    const [result] = await pool.query(
      'INSERT INTO trending_items (name, image_url, region, price, badge, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, image_url, region, price, badge, sort_order || 0]
    );
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, image_url, region, price, badge, sort_order, is_active } = await request.json();
    await pool.query(
      'UPDATE trending_items SET name = ?, image_url = ?, region = ?, price = ?, badge = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [name, image_url, region, price, badge, sort_order, is_active, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await pool.query('DELETE FROM trending_items WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}