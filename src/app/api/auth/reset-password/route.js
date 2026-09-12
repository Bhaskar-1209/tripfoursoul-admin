import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { email, otp, password } = await request.json();

    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!otp?.trim()) return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    if (!password) return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const admins = await db.query(
      `SELECT id FROM admins
       WHERE LOWER(email) = LOWER($1)
         AND otp_code = $2
         AND otp_expires_at > CURRENT_TIMESTAMP
         AND is_active = true`,
      [email.trim(), otp.trim()]
    );

    if (!admins.length) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please request a new one.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.update('admins', admins[0].id, {
      password: passwordHash,
      otp_code: null,
      otp_expires_at: null,
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Unable to reset password. Please try again.' }, { status: 500 });
  }
}