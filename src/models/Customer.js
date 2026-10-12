import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, required: true, enum: ['BILL_CREDIT', 'CASH_PAYMENT', 'INITIAL_BALANCE', 'ADJUSTMENT'] },
    orderId: { type: String, default: '' },
    description: { type: String, default: '' },
    billTotal: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    creditAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Cash' },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: true },
    phone: { type: String, default: '', index: true },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
    currentBalance: { type: Number, default: 0 },
    transactions: [TransactionSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
