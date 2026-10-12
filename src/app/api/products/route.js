import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Product from '../../../models/Product';
import { INITIAL_PRODUCTS } from '../../../data/mock/mockProducts';

export async function GET() {
  try {
    await connectToDatabase();
    let products = await Product.find({}).sort({ createdAt: -1 }).lean();

    // Auto-seed if database is freshly created and empty
    if (!products || products.length === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      products = await Product.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, data: products });
  } catch (err) {
    console.error('API Products GET Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const productId = body.id || `prod_${Date.now()}`;
    const productData = {
      ...body,
      id: productId,
    };

    const updated = await Product.findOneAndUpdate(
      { id: productId },
      productData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('API Products POST Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
