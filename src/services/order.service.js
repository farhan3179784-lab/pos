import { storageService } from './storage.service';
import { generateOrderId, generateId } from '../utils/idGenerator';

export const orderService = {
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(storageService.getOrders());
      }, 50);
    });
  },

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orders = storageService.getOrders();
        const found = orders.find((o) => o.id === id);
        if (found) resolve(found);
        else reject(new Error(`Order ${id} not found`));
      }, 50);
    });
  },

  async createOrder({ items, pricing, payment, customer }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const products = storageService.getProducts();

        // 1. Validate stock for all items
        for (const item of items) {
          const product = products.find((p) => p.id === (item.productId || item.id));
          if (!product) {
            return reject(new Error(`Product ${item.name} not found`));
          }
          if (product.stock < item.quantity) {
            return reject(
              new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`)
            );
          }
        }

        // 2. Decrement inventory and log sales
        const logs = storageService.getInventoryLogs();
        const newLogs = [];

        items.forEach((item) => {
          const idx = products.findIndex((p) => p.id === (item.productId || item.id));
          if (idx !== -1) {
            const prev = Number(products[idx].stock) || 0;
            const updatedStock = Math.max(0, Math.round((prev - item.quantity) * 1000) / 1000);
            products[idx] = { ...products[idx], stock: updatedStock };

            newLogs.push({
              id: generateId('log'),
              productId: products[idx].id,
              sku: products[idx].sku,
              productName: products[idx].name,
              type: 'Sale',
              quantityChange: -item.quantity,
              previousStock: prev,
              newStock: updatedStock,
              reason: 'POS Customer Checkout',
              timestamp: new Date().toISOString(),
              adjustedBy: 'POS Terminal',
            });
          }
        });

        storageService.setProducts(products);
        storageService.setInventoryLogs([...newLogs, ...logs]);

        // 3. Create unique order record
        const newOrder = {
          id: generateOrderId(),
          createdAt: new Date().toISOString(),
          customer: customer || { name: 'Walk-in Customer', type: 'Walk-in' },
          items,
          pricing,
          payment: {
            method: payment.method,
            status: payment.status || 'Paid',
            tendered: payment.tendered || pricing.grandTotal,
            change: payment.change || 0,
          },
          status: 'Completed',
        };

        const orders = storageService.getOrders();
        const updatedOrders = [newOrder, ...orders];
        storageService.setOrders(updatedOrders);

        resolve(newOrder);
      }, 50);
    });
  },
};
