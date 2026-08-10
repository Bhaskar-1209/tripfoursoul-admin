import { NextResponse } from 'next/server';
import db from '@/lib/db';

const makeSlug = (value = '') => String(value).trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

// GET - Fetch blog posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    let posts = await db.query(`SELECT * FROM blogs${all ? '' : ' WHERE is_active = true'} ORDER BY created_at DESC`);
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create blog post
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, cover_image, gallery_images, author, tags, meta_title, meta_description, is_active } = body;

    if (!title) {
      return NextResponse.json({ error: 'Blog title is required' }, { status: 400 });
    }

    const blogSlug = slug || makeSlug(title);

    // Check for duplicate slug
    const existing = await db.query('SELECT * FROM blogs WHERE slug = $1', [blogSlug]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'A blog post with this slug already exists' }, { status: 400 });
    }

    const post = await db.insert('blogs', {
      title,
      slug: blogSlug,
      excerpt: excerpt || '',
      content: content || '',
      cover_image: cover_image || '',
      gallery_images: Array.isArray(gallery_images) ? gallery_images : [],
      author: author || '',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt || '',
      is_active: is_active !== undefined ? is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: post.id, post });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update blog post
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, slug, excerpt, content, cover_image, gallery_images, author, tags, meta_title, meta_description, is_active } = body;

    if (!id) return NextResponse.json({ error: 'Blog post ID required' }, { status: 400 });

    const existing = await db.get('blogs', Number(id));
    if (!existing) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug || makeSlug(title || existing.title);
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (gallery_images !== undefined) updateData.gallery_images = Array.isArray(gallery_images) ? gallery_images : [];
    if (author !== undefined) updateData.author = author;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    const updated = await db.update('blogs', Number(id), updateData);
    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete blog post
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Blog post ID required' }, { status: 400 });

    const existing = await db.get('blogs', Number(id));
    if (!existing) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });

    await db.delete('blogs', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
