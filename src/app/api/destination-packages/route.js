import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch packages for a destination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destination_id');
    
    if (!destinationId) {
      return NextResponse.json({ error: 'Destination ID required' }, { status: 400 });
    }
    
    // Do not expose packages from an unpublished destination on the public
    // destination-detail page, even when the package itself is published.
    const packages = await db.query(
      `SELECT p.*
       FROM packages p
       INNER JOIN destinations d ON p.destination_id = d.id
       WHERE p.destination_id = $1 AND p.is_active = true AND d.is_active = true
       ORDER BY p.sort_order ASC, p.id DESC`,
      [Number(destinationId)]
    );
    return NextResponse.json({ packages });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Link package to destination
export async function POST(request) {
  try {
    const body = await request.json();
    const { destination_id, package_id } = body;
    
    if (!destination_id || !package_id) {
      return NextResponse.json({ error: 'Destination ID and package ID required' }, { status: 400 });
    }
    
    const updated = await db.update('packages', Number(package_id), { destination_id: Number(destination_id) });
    
    return NextResponse.json({ 
      success: true, 
      id: updated?.id,
      message: 'Package assigned to destination successfully' 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Unlink package from destination
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destination_id');
    const packageId = searchParams.get('package_id');
    
    if (!destinationId || !packageId) {
      return NextResponse.json({ error: 'Destination ID and package ID required' }, { status: 400 });
    }
    
    await db.update('packages', Number(packageId), { destination_id: null });
    
    return NextResponse.json({ success: true, message: 'Package unlinked successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
