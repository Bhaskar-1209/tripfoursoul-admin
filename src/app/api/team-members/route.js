import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all team members
export async function GET() {
  try {
    const team = await db.query('SELECT * FROM team_members WHERE is_active = true');
    team.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create team member
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, designation, bio, image_url, sort_order } = body;

    const member = await db.insert('team_members', { name, designation, bio, image_url: image_url || '', sort_order: sort_order || 0, is_active: true });
    return NextResponse.json({ success: true, id: member.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update team member
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, designation, bio, image_url, is_active, sort_order } = body;

    await db.update('team_members', id, { name, designation, bio, image_url, is_active, sort_order });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete team member
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await db.delete('team_members', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
