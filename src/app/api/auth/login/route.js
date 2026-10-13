import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Admin from '../../../../models/Admin';

const DEFAULT_ADMIN = {
  email: 'admin@fusion.com',
  password: 'admin123',
  name: 'Super Admin (فیوژن ایڈمن)',
  role: 'admin',
};

export async function POST(req) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'براہ کرم ای میل اور پاس ورڈ درج کریں۔ (Please provide both email and password)',
        },
        { status: 400 }
      );
    }

    let adminFound = null;

    // Try MongoDB authentication if available
    try {
      await connectToDatabase();

      // Check if admin exists in database
      adminFound = await Admin.findOne({ email });

      // Auto-seed default admin if database has no admins at all
      if (!adminFound) {
        const count = await Admin.countDocuments();
        if (count === 0 && email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
          adminFound = await Admin.create(DEFAULT_ADMIN);
        }
      }
    } catch (dbErr) {
      console.warn('Database auth lookup notice (using fallback validation):', dbErr.message);
    }

    // Verify credentials
    let isValid = false;
    let adminProfile = null;

    if (adminFound) {
      if (adminFound.password === password) {
        isValid = true;
        adminProfile = {
          email: adminFound.email,
          name: adminFound.name || 'Admin',
          role: adminFound.role || 'admin',
        };
        // Update last login
        try {
          adminFound.lastLogin = new Date();
          await adminFound.save();
        } catch (_) {}
      }
    } else if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      // Default admin fallback
      isValid = true;
      adminProfile = {
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
        role: DEFAULT_ADMIN.role,
      };
    }

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'غلط ای میل یا پاس ورڈ درج کیا گیا ہے۔ (Invalid email or password)',
        },
        { status: 401 }
      );
    }

    // Generate session token
    const token = `pos_admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response = NextResponse.json({
      success: true,
      message: 'کامیابی سے لاگ ان ہو گئے۔ (Logged in successfully)',
      admin: adminProfile,
      token,
    });

    // Set secure cookie for session
    response.cookies.set('pos_admin_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('API Auth Login Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'لاگ ان کے دوران خرابی پیش آگئی۔ (Login failed)',
      },
      { status: 500 }
    );
  }
}
