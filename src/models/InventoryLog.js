import mongoose from 'mongoose';

const InventoryLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    type: { type: String, default: 'ADJUSTMENT' },
    delta: { type: Number, required: true },
    reason: { type: String, default: '' },
    prevStock: { type: Number, default: 0 },
    newStock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.InventoryLog || mongoose.model('InventoryLog', InventoryLogSchema);
