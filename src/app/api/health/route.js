import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      status: 'connected',
      message: 'MongoDB Atlas is connected and operational.',
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        message: err.message,
        hint: err.message.includes('ENOTFOUND') || err.message.includes('querySrv')
          ? 'Please replace YOUR_CLUSTER in MONGODB_URI with your real MongoDB Atlas cluster domain.'
          : undefined,
      },
      { status: 500 }
    );
  }
}
