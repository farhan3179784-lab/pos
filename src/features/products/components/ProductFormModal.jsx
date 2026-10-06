import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PRODUCT_CATEGORIES } from '../../../constants/categories';
import { UNIT_OPTIONS, STANDARD_UNITS } from '../../../constants/units';

const categoriesList = PRODUCT_CATEGORIES.filter((c) => c !== 'All Categories');
const unitSelectOptions = UNIT_OPTIONS.map((u) => ({
  value: u.key,
  label: `${u.label} • ${u.urdu}`,
}));

const ProductFormContent = ({ product, onSave, onClose }) => {
  const isEditing = Boolean(product?.id);

  const [formData, setFormData] = useState({
    id: product?.id,
    name: product?.name || '',
    nameUrdu: product?.nameUrdu || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    category: product?.category || categoriesList[0] || 'Bakery & Snacks',
    unit: product?.unit || 'kg',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
    threshold: product?.threshold ?? '10',
    image: product?.image || '',
    description: product?.description || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'Valid price is required';
    if (formData.stock === '' || Number(formData.stock) < 0) errs.stock = 'Stock must be 0 or more';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        unit: formData.unit || 'pcs',
        barcode: formData.barcode.trim() || formData.sku.trim() || `896${Date.now().toString().slice(-8)}`,
        price: Number(formData.price),
        stock: Number(formData.stock),
        threshold: Number(formData.threshold) || 10,
        image: formData.image?.trim() || '',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUnitConfig = STANDARD_UNITS[formData.unit] || STANDARD_UNITS.pcs;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Product Name (English)"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g. Basmati Rice"
          required
        />
        <Input
          label="اردو نام (Urdu Name on Slip)"
          name="nameUrdu"
          value={formData.nameUrdu}
          onChange={handleChange}
          placeholder="مثلاً: چاول دوائز / چینی"
          inputClassName="font-urdu text-right"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Barcode / EAN-13 (بار کوڈ)"
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
          placeholder="مثلاً: 896400100101"
          icon="barcode"
        />
        <Input
          label="Custom SKU (Optional)"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Auto-generated if empty"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categoriesList}
        />
        <Select
          label="Standard Unit (اکائی)"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          options={unitSelectOptions}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label={`Price per ${currentUnitConfig.short} (Rs.)`}
          name="price"
          type="number"
          step="1"
          min="0"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          placeholder="Rs. 0"
          required
        />
        <Input
          label={`Initial Stock (${currentUnitConfig.short})`}
          name="stock"
          type="number"
          step={currentUnitConfig.defaultStep || '0.1'}
          min="0"
          value={formData.stock}
          onChange={handleChange}
          error={errors.stock}
          placeholder="0"
          required
        />
        <Input
          label={`Low Alert (${currentUnitConfig.short})`}
          name="threshold"
          type="number"
          step={currentUnitConfig.defaultStep || '1'}
          min="0.1"
          value={formData.threshold}
          onChange={handleChange}
          placeholder="10"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">
          Product Description / تفصیل (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          placeholder="پروڈکٹ کی تفصیل یا نوٹس..."
          className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export const ProductFormModal = ({
  isOpen,
  onClose,
  product = null,
  onSave,
}) => {
  const isEditing = Boolean(product?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add New Product'}
      subtitle={isEditing ? `Update details for SKU: ${product?.sku}` : 'Fill in catalog information'}
      maxWidth="max-w-xl"
    >
      {isOpen && (
        <ProductFormContent
          key={product?.id || 'new_product'}
          product={product}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};
