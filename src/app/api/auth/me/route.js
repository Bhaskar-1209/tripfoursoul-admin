import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: payload.id,
        username: payload.username,
        role: payload.role || 'admin',
        permissions: payload.permissions || null,
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}