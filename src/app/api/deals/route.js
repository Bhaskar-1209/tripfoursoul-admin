import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch deals settings
export async function GET() {
  try {
    const data = await db.query('SELECT * FROM deals_settings ORDER BY id ASC LIMIT 1');
    if (data.length > 0) {
      return NextResponse.json(data[0]);
    }
    return NextResponse.json({
      tagline: 'Travel offers',
      heading: 'Make more of every journey.',
      description: 'Discover current seasonal offers and speak with our team to find the journey that suits your plans.',
      button_text: 'Ask about offers',
      button_link: '/contact?subject=Offer%20enquiry',
      card_tagline: 'Planning made personal',
      card_heading: 'Get a tailored recommendation, clear inclusions, and expert support before you book.',
      card_description: 'Offer availability and final pricing are confirmed by the travel team.',
      is_active: true
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update deals settings
export async function PUT(request) {
  try {
    const body = await request.json();
    const data = await db.query('SELECT * FROM deals_settings ORDER BY id ASC LIMIT 1');
    if (data.length > 0) {
      const updated = await db.update('deals_settings', data[0].id, body);
      return NextResponse.json({ success: true, settings: updated });
    } else {
      const created = await db.insert('deals_settings', body);
      return NextResponse.json({ success: true, settings: created });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
