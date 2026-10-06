import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PRODUCT_CATEGORIES } from '../../../constants/categories';

const categoriesList = PRODUCT_CATEGORIES.filter((c) => c !== 'All Categories');

const ProductFormContent = ({ product, onSave, onClose }) => {
  const isEditing = Boolean(product?.id);

  const [formData, setFormData] = useState({
    id: product?.id,
    name: product?.name || '',
    nameUrdu: product?.nameUrdu || '',
    sku: product?.sku || '',
    category: product?.category || categoriesList[0] || 'Bakery & Snacks',
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
        price: Number(formData.price),
        stock: Number(formData.stock),
        threshold: Number(formData.threshold) || 10,
        image:
          formData.image.trim() ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categoriesList}
        />
        <Input
          label="Custom SKU (Optional)"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Auto-generated if empty"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Price (Rs.)"
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
          label="Initial Stock"
          name="stock"
          type="number"
          min="0"
          value={formData.stock}
          onChange={handleChange}
          error={errors.stock}
          placeholder="0"
          required
        />
        <Input
          label="Low Threshold"
          name="threshold"
          type="number"
          min="1"
          value={formData.threshold}
          onChange={handleChange}
          placeholder="10"
        />
      </div>

      <Input
        label="Image URL (Optional)"
        name="image"
        value={formData.image}
        onChange={handleChange}
        placeholder="https://..."
      />

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
      maxWidth="max-w-lg"
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
