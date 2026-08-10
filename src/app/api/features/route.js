import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all features
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const features = await db.query('SELECT * FROM features WHERE is_active = $1 OR $2 = true', [true, all]);
    features.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ features });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create feature
export async function POST(request) {
  try {
    const body = await request.json();
    const { icon, title, description, sort_order } = body;
    
    const feature = await db.insert('features', { icon, title, description, sort_order: sort_order || 0, is_active: true });
    return NextResponse.json({ success: true, id: feature.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update feature
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, icon, title, description, is_active, sort_order } = body;
    
    await db.update('features', id, { icon, title, description, is_active, sort_order });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete feature
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await db.delete('features', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
