import { storageService } from './storage.service';
import { generateId, generateSku } from '../utils/idGenerator';

export const productService = {
  async getAll() {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            storageService.setProducts(json.data);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local cache:', err.message);
      }
    }
    return storageService.getProducts();
  },

  async getById(id) {
    const products = await this.getAll();
    const found = products.find((p) => p.id === id);
    if (found) return found;
    throw new Error(`Product ${id} not found`);
  },

  async save(productData) {
    const products = storageService.getProducts();
    let updatedProduct;
    let updatedList;

    if (productData.id) {
      updatedProduct = { ...productData };
      updatedList = products.map((p) =>
        p.id === productData.id ? { ...p, ...productData } : p
      );
    } else {
      updatedProduct = {
        ...productData,
        id: generateId('prod'),
        sku: productData.sku || generateSku(productData.category),
        stock: Number(productData.stock) || 0,
        threshold: Number(productData.threshold) || 10,
        price: Number(productData.price) || 0,
        image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      };
      updatedList = [updatedProduct, ...products];
    }

    storageService.setProducts(updatedList);

    // Sync with MongoDB API in background
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct),
        }).catch((e) => console.warn('Product API sync error:', e));
      } catch (e) {
        // silent fail to ensure offline/quick POS operations
      }
    }

    return updatedProduct;
  },

  async delete(id) {
    const products = storageService.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    storageService.setProducts(filtered);

    // Sync with MongoDB API in background
    if (typeof window !== 'undefined') {
      try {
        fetch(`/api/products/${id}`, {
          method: 'DELETE',
        }).catch((e) => console.warn('Product delete API error:', e));
      } catch (e) {
        // silent
      }
    }

    return true;
  },
};
