import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameUrdu: { type: String, default: '' },
    sku: { type: String, default: '' },
    barcode: { type: String, default: '', index: true },
    category: { type: String, default: 'General' },
    unit: { type: String, default: 'pcs' },
    price: { type: Number, required: true, default: 0 },
    costPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    threshold: { type: Number, default: 10 },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
