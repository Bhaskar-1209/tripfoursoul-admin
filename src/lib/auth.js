import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tripforsoul-admin-secret-key-2026';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getTokenFromCookies(request) {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}