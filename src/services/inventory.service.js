import { storageService } from './storage.service';
import { generateId } from '../utils/idGenerator';

export const inventoryService = {
  async adjustStock({ productId, delta, reason, adjustedBy = 'Admin' }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const products = storageService.getProducts();
        const index = products.findIndex((p) => p.id === productId);

        if (index === -1) {
          return reject(new Error('Product not found in inventory'));
        }

        const product = products[index];
        const previousStock = Number(product.stock) || 0;
        const newStock = previousStock + Number(delta);

        if (newStock < 0) {
          return reject(new Error('Stock quantity cannot be negative'));
        }

        // Update product stock
        products[index] = { ...product, stock: newStock };
        storageService.setProducts(products);

        // Add history log entry
        const logs = storageService.getInventoryLogs();
        const newLog = {
          id: generateId('log'),
          productId,
          sku: product.sku,
          productName: product.name,
          type: Number(delta) >= 0 ? 'Restock' : 'Adjustment',
          quantityChange: Number(delta),
          previousStock,
          newStock,
          reason: reason || 'Manual inventory adjustment',
          timestamp: new Date().toISOString(),
          adjustedBy,
        };

        const updatedLogs = [newLog, ...logs];
        storageService.setInventoryLogs(updatedLogs);

        resolve({ product: products[index], log: newLog });
      }, 50);
    });
  },

  async getLogs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(storageService.getInventoryLogs());
      }, 50);
    });
  },
};
