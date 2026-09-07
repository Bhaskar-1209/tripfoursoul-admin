import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: 'Reset token and new password are required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const admins = await db.query(
      'SELECT id FROM admins WHERE reset_token_hash = $1 AND reset_token_expires_at > CURRENT_TIMESTAMP AND is_active = true',
      [hashToken(token)]
    );
    if (!admins.length) return NextResponse.json({ error: 'This reset link is invalid or expired' }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);
    await db.update('admins', admins[0].id, {
      password: passwordHash,
      reset_token_hash: null,
      reset_token_expires_at: null,
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Unable to reset password' }, { status: 500 });
  }
}