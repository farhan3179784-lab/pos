import { storageService } from './storage.service';
import { generateId } from '../utils/idGenerator';

export const inventoryService = {
  async adjustStock({ productId, delta, reason, adjustedBy = 'Admin' }) {
    const products = storageService.getProducts();
    const index = products.findIndex((p) => p.id === productId);

    if (index === -1) {
      throw new Error('Product not found in inventory');
    }

    const product = products[index];
    const previousStock = Number(product.stock) || 0;
    const newStock = previousStock + Number(delta);

    if (newStock < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    // Update product stock locally
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

    // Sync with MongoDB API in background
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, delta, reason }),
        }).catch((e) => console.warn('Inventory API sync error:', e));
      } catch (e) {
        // silent
      }
    }

    return { product: products[index], log: newLog };
  },

  async getLogs() {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/inventory');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            storageService.setInventoryLogs(json.data);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('API fetch inventory logs failed, falling back to local cache:', err.message);
      }
    }
    return storageService.getInventoryLogs();
  },
};
