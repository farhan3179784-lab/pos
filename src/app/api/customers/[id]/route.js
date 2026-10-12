import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Customer from '../../../../models/Customer';

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    await Customer.findOneAndDelete({ id });
    return NextResponse.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    console.error('API Customer DELETE Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
