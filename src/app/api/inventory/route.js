import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import InventoryLog from '../../../models/InventoryLog';
import Product from '../../../models/Product';

export async function GET() {
  try {
    await connectToDatabase();
    const logs = await InventoryLog.find({}).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    console.error('API Inventory GET Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { productId, delta, reason = '' } = await req.json();

    const change = Number(delta) || 0;
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const prevStock = product.stock;
    const newStock = Math.max(0, prevStock + change);
    product.stock = newStock;
    await product.save();

    const log = await InventoryLog.create({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      productName: product.name,
      type: 'ADJUSTMENT',
      delta: change,
      reason,
      prevStock,
      newStock,
    });

    return NextResponse.json({
      success: true,
      data: { product, log },
    });
  } catch (err) {
    console.error('API Inventory POST Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
