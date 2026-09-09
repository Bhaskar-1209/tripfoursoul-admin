import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getNextSortOrder } from '@/lib/sortOrder';

export const dynamic = 'force-dynamic';

const makeSlug = (value = '') => String(value).trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

// Auto-create the blog_categories table if it doesn't exist
const ensureTable = async () => {
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
    // Insert default categories if table was just created
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
    // Ensure blogs table has category_id column
    try { await db.query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category_id INT`); } catch (e) {}
  } catch (error) {
    console.warn('Failed to ensure blog_categories table:', error.message);
  }
};

// GET - Fetch blog categories
export async function GET(request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    let categories = await db.query(`SELECT * FROM blog_categories${all ? '' : ' WHERE is_active = true'} ORDER BY sort_order ASC, name ASC`);
    
    // Get post counts for each category
    for (const cat of categories) {
      try {
        const countResult = await db.query('SELECT COUNT(*) as count FROM blogs WHERE category_id = $1 AND is_active = true', [cat.id]);
        cat.post_count = countResult[0]?.count || 0;
      } catch (e) {
        cat.post_count = 0;
      }
    }
    
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create blog category
export async function POST(request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { name, slug, description, image_url, sort_order, is_active } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    if (!image_url?.trim()) {
      return NextResponse.json({ error: 'Category image is required' }, { status: 400 });
    }

    const catSlug = slug || makeSlug(name);

    // Check for duplicate slug
    const existing = await db.query('SELECT * FROM blog_categories WHERE slug = $1', [catSlug]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 });
    }

    const categoryActive = is_active !== undefined ? Boolean(is_active) : true;
    const categorySort = categoryActive ? (Number(sort_order) > 0 ? Number(sort_order) : await getNextSortOrder('blog_categories')) : 0;

    // Check for duplicate sort number among active categories
    if (categorySort > 0) {
      const sortDuplicates = await db.query('SELECT id FROM blog_categories WHERE sort_order = $1 AND is_active = true', [categorySort]);
      if (sortDuplicates.length > 0) {
        return NextResponse.json({ error: `Sort number ${categorySort} is already used by another active category. Deactivate that category or choose a different number.` }, { status: 400 });
      }
    }

    const category = await db.insert('blog_categories', {
      name,
      slug: catSlug,
      description: description || '',
      image_url: image_url || '',
      sort_order: categorySort,
      is_active: categoryActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: category.id, category });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update blog category
export async function PUT(request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { id, name, slug, description, image_url, sort_order, is_active } = body;

    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    const existing = await db.get('blog_categories', Number(id));
    if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    // The image is compulsory: explicitly clearing it is rejected so the user
    // must upload a replacement before saving. Partial updates (e.g. activating
    // from the list page) that omit image_url are unaffected.
    if (image_url !== undefined && !String(image_url || '').trim()) {
      return NextResponse.json({ error: 'Category image is required' }, { status: 400 });
    }

    // Unpublishing frees the sort number so another item can use it.
    const nextActive = is_active !== undefined ? Boolean(is_active) : Boolean(existing.is_active);
    const nextSortOrder = nextActive ? (sort_order !== undefined ? Number(sort_order) : Number(existing.sort_order) || 0) : null;

    if (nextActive && nextSortOrder > 0) {
      const sortDuplicates = await db.query('SELECT id FROM blog_categories WHERE sort_order = $1 AND is_active = true AND id != $2', [nextSortOrder, Number(id)]);
      if (sortDuplicates.length > 0) {
        return NextResponse.json({ error: `Sort number ${nextSortOrder} is already used by another active category. Deactivate that category or choose a different number.` }, { status: 400 });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug || makeSlug(name || existing.name);
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    updateData.sort_order = nextSortOrder;
    updateData.is_active = nextActive;
    updateData.updated_at = new Date().toISOString();

    const updated = await db.update('blog_categories', Number(id), updateData);
    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete blog category
export async function DELETE(request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    const existing = await db.get('blog_categories', Number(id));
    if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    // Check if any blogs use this category
    const blogsWithCat = await db.query('SELECT COUNT(*) as count FROM blogs WHERE category_id = $1', [Number(id)]);
    if (blogsWithCat[0]?.count > 0) {
      return NextResponse.json({ error: `Cannot delete category. ${blogsWithCat[0].count} blog post(s) use this category.` }, { status: 400 });
    }

    await db.delete('blog_categories', Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}