import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getNextSortOrder } from '@/lib/sortOrder';

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

    const memberSort = Number(sort_order) > 0 ? Number(sort_order) : await getNextSortOrder('team_members');
    if (memberSort > 0) {
      const duplicates = await db.query('SELECT id FROM team_members WHERE sort_order = $1 AND is_active = true', [memberSort]);
      if (duplicates.length > 0) {
        return NextResponse.json({ error: `Sort number ${memberSort} is already used by another team member. Choose a different number.` }, { status: 400 });
      }
    }

    const member = await db.insert('team_members', { name, designation, bio, image_url: image_url || '', sort_order: memberSort, is_active: true });
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

    const nextActive = is_active !== undefined ? Boolean(is_active) : true;
    const nextSortOrder = nextActive ? (Number(sort_order) || 0) : null;

    if (nextActive && nextSortOrder > 0) {
      const duplicates = await db.query('SELECT id FROM team_members WHERE sort_order = $1 AND is_active = true AND id != $2', [nextSortOrder, Number(id)]);
      if (duplicates.length > 0) {
        return NextResponse.json({ error: `Sort number ${nextSortOrder} is already used by another team member. Choose a different number.` }, { status: 400 });
      }
    }

    await db.update('team_members', id, { name, designation, bio, image_url, is_active, sort_order: nextSortOrder });

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
