import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';
import db from '@/lib/db';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
// Generate secure 6-digit OTP using Node's built-in crypto
const generateOTP = () => randomInt(100000, 1000000).toString();

let schemaReady;
const ensureOTPColumns = () => {
  if (!schemaReady) {
    schemaReady = Promise.all([
      db.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6)'),
      db.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP'),
    ]).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
};

const sendOTPEmail = async (email, otp) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;
// Create SMTP transporter using env variables
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your TripForSoul Admin Password Reset OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
          <h2 style="color: #24564C;">Password Reset OTP</h2>
          <p>Use the following OTP to reset your TripForSoul admin password:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #24564C; background: #DCE8DF; padding: 16px; border-radius: 8px; text-align: center;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 16px;">This OTP is valid for <strong>10 minutes</strong> and can only be used once.</p>
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (TLS)
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

const sendOTPEmail = async (toEmail, otp) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"TripForSoul Admin" <${from}>`,
    to: toEmail,
    subject: 'Your Password Reset OTP — TripForSoul Admin',
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: auto; padding: 24px;">
        <h2 style="color: #24564C; margin-bottom: 8px;">Password Reset OTP</h2>
        <p style="color: #555;">Use the following OTP to reset your TripForSoul admin password:</p>
        <div style="
          font-size: 40px;
          font-weight: bold;
          letter-spacing: 10px;
          color: #24564C;
          background: #DCE8DF;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          margin: 20px 0;
        ">
          ${otp}
        </div>
      `,
    }),
        <p style="color: #888; font-size: 13px;">
          This OTP is valid for <strong>10 minutes</strong> and can only be used once.<br/>
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });

  return response.ok;
  return true;
};

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await ensureOTPColumns();

    const admins = await db.query(
      'SELECT id, email FROM admins WHERE LOWER(email) = LOWER($1) AND is_active = true',
      [email.trim()]
    );

    // Always return success to avoid leaking whether account exists
    if (!admins.length) {
      // Generic response to avoid leaking account existence
      return NextResponse.json({ success: true, message: 'If an account exists for that email, an OTP has been sent.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

    await db.update('admins', admins[0].id, {
      otp_code: otp,
      otp_expires_at: expiresAt,
    });

    const emailSent = await sendOTPEmail(admins[0].email, otp);
    const emailSent = await sendOTPEmail(admins[0].email, otp).catch((err) => {
      console.error('Email send error:', err.message);
      return false;
    });

    if (!emailSent) {
      // No email configured — return OTP directly (for internal admin tool use)
      // SMTP not configured — show OTP directly on screen
      return NextResponse.json({
        success: true,
        message: 'OTP generated successfully (email not configured, showing directly):',
        otp, // shown on screen when no email provider
        message: 'OTP generated. No SMTP configured — showing OTP directly:',
        otp,
        noEmail: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${admins[0].email}. Valid for 10 minutes.`,
    });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    return NextResponse.json({ error: 'Unable to send OTP. Please try again.' }, { status: 500 });
  }
}