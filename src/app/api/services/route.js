import { NextResponse } from 'next/server';
import db from '@/lib/db';

const makeSlug = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    let services = await db.query('SELECT * FROM services WHERE is_active = $1 OR $2 = true', [true, all]);
    services.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description = '', image_url = '', icon = '', sort_order = 0, is_active = true } = body;

    if (!title) {
      return NextResponse.json({ error: 'Service title is required' }, { status: 400 });
    }

    const slug = makeSlug(title);
    const existing = await db.query('SELECT * FROM services WHERE slug = $1', [slug]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'A service with this title already exists' }, { status: 400 });
    }

    const service = await db.insert('services', {
      title,
      slug,
      description,
      image_url,
      icon,
      sort_order: Number(sort_order),
      is_active: is_active,
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, description, image_url, icon, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    const existing = await db.get('services', Number(id));
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const updateData = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = makeSlug(title);
      const duplicate = await db.query('SELECT * FROM services WHERE slug = $1 AND id != $2', [updateData.slug, Number(id)]);
      if (duplicate.length > 0) {
        return NextResponse.json({ error: 'A service with this title already exists' }, { status: 400 });
      }
    }
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (icon !== undefined) updateData.icon = icon;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    await db.update('services', Number(id), updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    await db.delete('services', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
