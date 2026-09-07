import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import db from '@/lib/db';

const TOKEN_TTL_MS = 60 * 60 * 1000;

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

let schemaReady;
const ensureResetColumns = () => {
  if (!schemaReady) {
    schemaReady = Promise.all([
      db.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(64)'),
      db.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP'),
    ]).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
};

const sendResetEmail = async (email, resetUrl) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Reset your TripForSoul admin password',
      html: `<p>We received a request to reset your TripForSoul admin password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in one hour and can only be used once.</p>`,
    }),
  });

  if (!response.ok) throw new Error('Email provider rejected the reset email');
  return true;
};

export async function POST(request) {
  const genericResponse = { message: 'If an account exists for that email, a reset link has been sent.' };

  try {
    const { email } = await request.json();
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    await ensureResetColumns();
    const admins = await db.query('SELECT id, email FROM admins WHERE LOWER(email) = LOWER($1) AND is_active = true', [email.trim()]);
    if (!admins.length) return NextResponse.json(genericResponse);

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await db.update('admins', admins[0].id, {
      reset_token_hash: hashToken(token),
      reset_token_expires_at: expiresAt.toISOString(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const emailSent = await sendResetEmail(admins[0].email, resetUrl);

    // This helps local development without exposing reset tokens in production.
    if (!emailSent && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ ...genericResponse, resetUrl, developmentOnly: true });
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Unable to process password reset request' }, { status: 500 });
  }
}