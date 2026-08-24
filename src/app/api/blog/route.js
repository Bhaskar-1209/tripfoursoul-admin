import { NextResponse } from 'next/server';
import db from '@/lib/db';

const makeSlug = (value = '') => String(value).trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const MAX_BLOG_IMAGES = 3;

const hasTooManyGalleryImages = (images) => Array.isArray(images) && images.length > MAX_BLOG_IMAGES;

// Auto-create the blog_categories table if it doesn't exist
// This ensures the LEFT JOIN never fails on missing table
const ensureCategoriesTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query(`
      INSERT INTO blog_categories (name, slug, description, sort_order) VALUES
      ('Adventure', 'adventure', 'Thrilling adventures and adrenaline-filled travel experiences', 1),
      ('International Holidays', 'international-holidays', 'Explore the best international travel destinations and holiday ideas', 2),
      ('Domestic Holidays', 'domestic-holidays', 'Discover amazing travel destinations within India', 3),
      ('Travel Tips', 'travel-tips', 'Useful tips and guides for smarter travel planning', 4),
      ('Honeymoon', 'honeymoon', 'Romantic getaways and honeymoon destination ideas', 5),
      ('Family Holidays', 'family-holidays', 'Fun-filled holiday ideas for the whole family', 6),
      ('Luxury Travel', 'luxury-travel', 'Premium and luxury travel experiences', 7),
      ('Food & Culture', 'food-culture', 'Culinary journeys and cultural travel experiences', 8)
      ON CONFLICT (slug) DO NOTHING
    `);
    try { await db.query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category_id INT`); } catch (e) {}
  } catch (error) {
    console.warn('Failed to ensure blog_categories table:', error.message);
  }
};

// GET - Fetch blog posts
export async function GET(request) {
  try {
    await ensureCategoriesTable();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const category = searchParams.get('category');
    const categorySlug = searchParams.get('categorySlug');

    let sql = `SELECT b.*, c.name as category_name, c.slug as category_slug 
               FROM blogs b 
               LEFT JOIN blog_categories c ON b.category_id = c.id`;
    const conditions = [];
    const params = [];

    if (!all) {
      conditions.push('b.is_active = true');
    }
    if (category) {
      params.push(Number(category));
      conditions.push(`b.category_id = $${params.length}`);
    }
    if (categorySlug) {
      params.push(categorySlug);
      conditions.push(`c.slug = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY b.created_at DESC';

    let posts = await db.query(sql, params);

    // Parse JSON fields
    posts = posts.map(post => {
      try { post.gallery_images = Array.isArray(post.gallery_images) ? post.gallery_images : JSON.parse(post.gallery_images || '[]'); } catch { post.gallery_images = []; }
      try { post.tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags || '[]'); } catch { post.tags = []; }
      return post;
    });

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create blog post
export async function POST(request) {
  try {
    await ensureCategoriesTable();
    const body = await request.json();
    const { title, slug, excerpt, content, cover_image, gallery_images, author, tags, meta_title, meta_description, is_active, category_id } = body;

    if (!title) {
      return NextResponse.json({ error: 'Blog title is required' }, { status: 400 });
    }
    if (hasTooManyGalleryImages(gallery_images)) {
      return NextResponse.json({ error: `A blog can have a maximum of ${MAX_BLOG_IMAGES} images` }, { status: 400 });
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
      gallery_images: JSON.stringify(Array.isArray(gallery_images) ? gallery_images : []),
      author: author || '',
      tags: JSON.stringify(Array.isArray(tags) ? tags : (tags ? [tags] : [])),
      category_id: category_id || null,
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
    await ensureCategoriesTable();
    const body = await request.json();
    const { id, title, slug, excerpt, content, cover_image, gallery_images, author, tags, meta_title, meta_description, is_active, category_id } = body;

    if (!id) return NextResponse.json({ error: 'Blog post ID required' }, { status: 400 });
    if (hasTooManyGalleryImages(gallery_images)) {
      return NextResponse.json({ error: `A blog can have a maximum of ${MAX_BLOG_IMAGES} images` }, { status: 400 });
    }

    const existing = await db.get('blogs', Number(id));
    if (!existing) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug || makeSlug(title || existing.title);
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (gallery_images !== undefined) updateData.gallery_images = JSON.stringify(Array.isArray(gallery_images) ? gallery_images : []);
    if (author !== undefined) updateData.author = author;
    if (tags !== undefined) updateData.tags = JSON.stringify(Array.isArray(tags) ? tags : (tags ? [tags] : []));
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (category_id !== undefined) updateData.category_id = category_id || null;
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
    await ensureCategoriesTable();
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
