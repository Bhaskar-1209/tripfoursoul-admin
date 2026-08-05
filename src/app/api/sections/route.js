import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const sections = await db.query('SELECT * FROM homepage_sections');
    sections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ sections });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Support both single object { id, is_visible, sort_order } and array { sections: [...] }
    let sectionsToUpdate = [];
    if (Array.isArray(body.sections)) {
      sectionsToUpdate = body.sections;
    } else if (body.id !== undefined) {
      sectionsToUpdate = [body];
    }
    
    for (const section of sectionsToUpdate) {
      const updateData = {};
      if (section.is_visible !== undefined) updateData.is_visible = section.is_visible;
      if (section.sort_order !== undefined) updateData.sort_order = section.sort_order;
      if (section.section_name !== undefined) updateData.section_name = section.section_name;
      if (section.section_key !== undefined) updateData.section_key = section.section_key;
      await db.update('homepage_sections', section.id, updateData);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
