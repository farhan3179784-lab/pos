import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import Customer from '../../../models/Customer';
import InventoryLog from '../../../models/InventoryLog';

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    console.error('API Orders GET Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const orderData = await req.json();

    const orderId = orderData.id || `${Date.now()}`;
    const order = new Order({
      ...orderData,
      id: orderId,
    });
    await order.save();

    // 1. Deduct Product Stock & Log Inventory
    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        if (!item.id) continue;
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;

        const product = await Product.findOne({ id: item.id });
        if (product) {
          const prevStock = product.stock;
          const newStock = Math.max(0, prevStock - qty);
          product.stock = newStock;
          await product.save();

          await InventoryLog.create({
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            productId: product.id,
            productName: product.name,
            type: 'SALE',
            delta: -qty,
            reason: `Order #${orderId}`,
            prevStock,
            newStock,
          });
        }
      }
    }

    // 2. Automated Khata Ledger Update (for credit bills)
    const remainingDue = Number(orderData.payment?.remaining) || 0;
    const customer = orderData.customer;
    const isNamedCustomer = customer && customer.name && !customer.name.startsWith('Walk-in');

    if (remainingDue > 0 && isNamedCustomer) {
      const customerDoc = await Customer.findOne({
        $or: [{ id: customer.id }, { name: customer.name }],
      });

      const billTotal = Number(orderData.pricing?.grandTotal) || 0;
      const paidAmount = Number(orderData.payment?.tendered) || (billTotal - remainingDue);

      if (customerDoc) {
        const prevBal = Number(customerDoc.currentBalance) || 0;
        const newBal = prevBal + remainingDue;

        customerDoc.currentBalance = newBal;
        customerDoc.transactions.push({
          id: `tx_${Date.now()}`,
          date: new Date(),
          type: 'BILL_CREDIT',
          orderId,
          description: `بل خریداری #${orderId} (کل بل: ${billTotal.toLocaleString()}، ادا: ${paidAmount.toLocaleString()})`,
          billTotal,
          paidAmount,
          creditAmount: remainingDue,
          debit: remainingDue,
          credit: 0,
          balanceAfter: newBal,
        });

        await customerDoc.save();
      } else {
        // Auto-create customer if does not exist
        const newCustId = customer.id || `cust_${Date.now()}`;
        await Customer.create({
          id: newCustId,
          name: customer.name,
          phone: customer.phone || '',
          address: customer.address || '',
          currentBalance: remainingDue,
          transactions: [
            {
              id: `tx_${Date.now()}`,
              date: new Date(),
              type: 'BILL_CREDIT',
              orderId,
              description: `بل خریداری #${orderId} (کل بل: ${billTotal.toLocaleString()}، ادا: ${paidAmount.toLocaleString()})`,
              billTotal,
              paidAmount,
              creditAmount: remainingDue,
              debit: remainingDue,
              credit: 0,
              balanceAfter: remainingDue,
            },
          ],
        });
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    console.error('API Orders POST Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
