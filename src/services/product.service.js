import { storageService } from './storage.service';
import { generateId, generateSku } from '../utils/idGenerator';

export const productService = {
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = storageService.getProducts();
        resolve(products);
      }, 50);
    });
  },

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const products = storageService.getProducts();
        const found = products.find((p) => p.id === id);
        if (found) resolve(found);
        else reject(new Error(`Product ${id} not found`));
      }, 50);
    });
  },

  async save(productData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = storageService.getProducts();
        let updated;

        if (productData.id) {
          updated = products.map((p) =>
            p.id === productData.id ? { ...p, ...productData } : p
          );
        } else {
          const newProduct = {
            ...productData,
            id: generateId('prod'),
            sku: productData.sku || generateSku(productData.category),
            stock: Number(productData.stock) || 0,
            threshold: Number(productData.threshold) || 10,
            price: Number(productData.price) || 0,
            image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
          };
          updated = [newProduct, ...products];
        }

        storageService.setProducts(updated);
        resolve(productData.id ? productData : updated[0]);
      }, 50);
    });
  },

  async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = storageService.getProducts();
        const filtered = products.filter((p) => p.id !== id);
        storageService.setProducts(filtered);
        resolve(true);
      }, 50);
    });
  },
};
