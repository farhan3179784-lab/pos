import { INITIAL_PRODUCTS } from '../data/mock/mockProducts';
import { INITIAL_ORDERS } from '../data/mock/mockOrders';
import { INITIAL_INVENTORY_LOGS } from '../data/mock/mockInventory';

const STORAGE_KEYS = {
  PRODUCTS: 'superstore_pos_products_v3', // new clean key
  ORDERS: 'superstore_pos_orders_v3',
  INVENTORY_LOGS: 'superstore_pos_inventory_logs_v3',
};

export const storageService = {
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        // Also check if user had previously created custom products in v2
        const oldData = localStorage.getItem('superstore_pos_products_v2');
        if (oldData) {
          const parsedOld = JSON.parse(oldData);
          if (Array.isArray(parsedOld)) {
            // Keep only products that are NOT mock products
            const customOnly = parsedOld.filter(
              (p) => !p.id?.startsWith('prod_10') && p.name && p.price
            );
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(customOnly));
            return customOnly;
          }
        }
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
        return [];
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => !p.id?.startsWith('prod_10'));
      }
      return [];
    } catch {
      return [];
    }
  },

  setProducts(products) {
    try {
      const clean = Array.isArray(products)
        ? products.filter((p) => !p.id?.startsWith('prod_10'))
        : [];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(clean));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  },

  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  setOrders(orders) {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  },

  getInventoryLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  setInventoryLogs(logs) {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save inventory logs to localStorage', e);
    }
  },
};
