import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'لاگ آؤٹ ہو گیا۔ (Logged out successfully)',
  });

  response.cookies.delete('pos_admin_token');
  return response;
}
