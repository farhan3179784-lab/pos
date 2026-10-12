import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import Customer from '../../../../../models/Customer';

export async function POST(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { amount, note = '', paymentMethod = 'Cash' } = await req.json();

    const payAmount = Number(amount) || 0;
    if (payAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Payment amount must be greater than 0' },
        { status: 400 }
      );
    }

    const customer = await Customer.findOne({ id });
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    const prevBal = Number(customer.currentBalance) || 0;
    const newBal = prevBal - payAmount;

    customer.currentBalance = newBal;
    customer.transactions.push({
      id: `tx_${Date.now()}`,
      date: new Date(),
      type: 'CASH_PAYMENT',
      description: note || 'نقد رقم وصولی (کھاتہ جمع)',
      paymentMethod,
      debit: 0,
      credit: payAmount,
      balanceAfter: newBal,
    });

    await customer.save();

    return NextResponse.json({ success: true, data: customer });
  } catch (err) {
    console.error('API Customer Payment Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
