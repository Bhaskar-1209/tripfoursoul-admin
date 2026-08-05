import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Fallback login using JSON file
const loginWithJson = async (username, password) => {
  try {
    const jsonPath = path.join(process.cwd(), 'database.json');
    if (!fs.existsSync(jsonPath)) {
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const admins = data.admins || [];
    
    // Find admin by username or email
    const admin = admins.find(a => a.username === username || a.email === username);
    if (!admin) {
      return null;
    }
    
    // Check password
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return null;
    }
    
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role || 'admin',
      permissions: admin.permissions || (admin.username === 'admin' ? null : []),
    };
  } catch (error) {
    console.error('JSON login error:', error);
    return null;
  }
};

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    let admin = null;
    
    // Try MySQL first
    try {
      const admins = await db.query('SELECT * FROM admins WHERE username = ? OR email = ?', [username, username]);
      if (admins.length > 0) {
        const adminData = admins[0];
        const isValid = await bcrypt.compare(password, adminData.password);
        if (isValid) {
          admin = {
            id: adminData.id,
            username: adminData.username,
            email: adminData.email,
            role: adminData.role || 'admin',
            permissions: adminData.permissions || (adminData.username === 'admin' ? null : []),
          };
        }
      }
    } catch (mysqlError) {
      console.warn('MySQL login failed, trying JSON fallback:', mysqlError.message);
    }
    
    // Fallback to JSON if MySQL failed
    if (!admin) {
      admin = await loginWithJson(username, password);
    }

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      id: admin.id,
      username: admin.username,
      role: admin.role || 'admin',
      permissions: admin.permissions || (admin.username === 'admin' ? null : []),
    });

    const response = NextResponse.json({ success: true, token });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
