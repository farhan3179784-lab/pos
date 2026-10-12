import { storageService } from './storage.service';
import { generateOrderId, generateId } from '../utils/idGenerator';

export const orderService = {
  async getAll() {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            storageService.setOrders(json.data);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('API fetch orders failed, falling back to local cache:', err.message);
      }
    }
    return storageService.getOrders();
  },

  async getById(id) {
    const orders = await this.getAll();
    const found = orders.find((o) => o.id === id);
    if (found) return found;
    throw new Error(`Order ${id} not found`);
  },

  async createOrder({ id, createdAt, items, pricing, payment, customer }) {
    const products = storageService.getProducts();

    // 1. Validate stock for all items
    for (const item of items) {
      const product = products.find((p) => p.id === (item.productId || item.id));
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
      }
    }

    // 2. Decrement local inventory and log sales for immediate reactivity
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
      id: id || generateOrderId(),
      createdAt: createdAt || new Date().toISOString(),
      customer: customer || { name: 'Walk-in Customer (کاؤنٹر گاہک)', type: 'Walk-in' },
      items,
      pricing,
      payment: {
        method: payment.method || 'Cash',
        status: payment.status || (payment.remaining > 0 ? 'Partial' : 'Paid'),
        tendered: payment.tendered !== undefined ? payment.tendered : pricing.grandTotal,
        change: payment.change || 0,
        remaining: payment.remaining || 0,
        prevBalance: payment.prevBalance || 0,
        totalBalanceAfter: payment.totalBalanceAfter || 0,
        notes: payment.notes || '',
      },
      status: 'Completed',
    };

    const orders = storageService.getOrders();
    const updatedOrders = [newOrder, ...orders];
    storageService.setOrders(updatedOrders);

    // 4. Background MongoDB Atlas API Sync
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder),
        }).catch((e) => console.warn('Order API sync error:', e));
      } catch (e) {
        // silent
      }
    }

    return newOrder;
  },
};
