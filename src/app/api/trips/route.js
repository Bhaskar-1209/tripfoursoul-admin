import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all trips
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const all = searchParams.get('all') === 'true';
    let trips = await db.query('SELECT * FROM trips WHERE is_active = $1 OR $2 = true', [true, all]);
    if (category && category !== 'all') trips = trips.filter((trip) => trip.category === category);
    trips.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ trips });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new trip
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, image_url, price, duration, days, location, category, badge, destination_id } = body;
    
    const trip = await db.insert('trips', { name, description, image_url, price, duration, days, location, category, badge, destination_id: destination_id || null, is_active: true, sort_order: 0 });
    
    return NextResponse.json({ 
      success: true, 
      id: trip.id,
      message: 'Trip created successfully' 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update trip
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, description, image_url, price, duration, days, location, category, badge, destination_id, is_active, sort_order } = body;
    
    await db.update('trips', id, { name, description, image_url, price, duration, days, location, category, badge, destination_id: destination_id || null, is_active, sort_order });
    
    return NextResponse.json({ success: true, message: 'Trip updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete trip
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Trip ID required' }, { status: 400 });
    }
    
    await db.delete('trips', Number(id));
    
    return NextResponse.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
