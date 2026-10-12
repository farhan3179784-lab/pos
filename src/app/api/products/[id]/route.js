import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    await Product.findOneAndDelete({ id });
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('API Product DELETE Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updated = await Product.findOneAndUpdate(
      { id },
      { ...body },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('API Product PUT Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
