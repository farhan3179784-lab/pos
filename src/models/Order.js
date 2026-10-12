import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameUrdu: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
    unit: { type: String, default: 'pcs' },
    barcode: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    items: [OrderItemSchema],
    pricing: {
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    payment: {
      method: { type: String, default: 'Cash' },
      tendered: { type: Number, default: 0 },
      change: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 },
      status: { type: String, default: 'Completed' },
    },
    customer: {
      id: { type: String, default: '' },
      name: { type: String, default: 'Walk-in Customer' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    cashier: { type: String, default: 'Counter 1' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
