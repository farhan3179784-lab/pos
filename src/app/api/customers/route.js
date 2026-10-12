import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Customer from '../../../models/Customer';
import { INITIAL_CUSTOMERS } from '../../../data/mock/mockCustomers';

export async function GET() {
  try {
    await connectToDatabase();
    let customers = await Customer.find({}).sort({ updatedAt: -1 }).lean();

    if (!customers || customers.length === 0) {
      await Customer.insertMany(INITIAL_CUSTOMERS);
      customers = await Customer.find({}).sort({ updatedAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, data: customers });
  } catch (err) {
    console.error('API Customers GET Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const customerData = await req.json();

    const customerId = customerData.id || `cust_${Date.now()}`;
    const existing = await Customer.findOne({ id: customerId });

    if (existing) {
      existing.name = customerData.name || existing.name;
      existing.phone = customerData.phone ?? existing.phone;
      existing.address = customerData.address ?? existing.address;
      existing.notes = customerData.notes ?? existing.notes;
      if (customerData.currentBalance !== undefined) {
        existing.currentBalance = customerData.currentBalance;
      }
      if (Array.isArray(customerData.transactions)) {
        existing.transactions = customerData.transactions;
      }
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    // New Customer
    const initialBal = Number(customerData.initialBalance || customerData.currentBalance) || 0;
    const transactions = [];

    if (initialBal > 0) {
      transactions.push({
        id: `tx_${Date.now()}`,
        date: new Date(),
        type: 'INITIAL_BALANCE',
        description: 'ابتدائی بقایا رقم (سابقہ کھاتہ)',
        debit: initialBal,
        credit: 0,
        balanceAfter: initialBal,
      });
    }

    const newCustomer = await Customer.create({
      ...customerData,
      id: customerId,
      currentBalance: initialBal,
      transactions: customerData.transactions || transactions,
    });

    return NextResponse.json({ success: true, data: newCustomer });
  } catch (err) {
    console.error('API Customers POST Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
