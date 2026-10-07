import { INITIAL_PRODUCTS } from '../data/mock/mockProducts';
import { INITIAL_ORDERS } from '../data/mock/mockOrders';
import { INITIAL_INVENTORY_LOGS } from '../data/mock/mockInventory';

const STORAGE_KEYS = {
  PRODUCTS: 'fusion_pos_products_v4',
  ORDERS: 'fusion_pos_orders_v4',
  INVENTORY_LOGS: 'fusion_pos_inventory_logs_v4',
  INITIALIZED: 'fusion_pos_initialized_v4',
};

export const storageService = {
  getProducts() {
    try {
      const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);

      if (!isInitialized || !data) {
        // Also check if user had previously created custom products in v2 or v3
        let existingCustom = [];
        const prevData =
          localStorage.getItem('superstore_pos_products_v3') ||
          localStorage.getItem('superstore_pos_products_v2');

        if (prevData) {
          try {
            const parsedOld = JSON.parse(prevData);
            if (Array.isArray(parsedOld) && parsedOld.length > 0) {
              existingCustom = parsedOld;
            }
          } catch {
            // ignore
          }
        }

        // If user already has custom products, preserve them; otherwise use INITIAL_PRODUCTS
        const finalProducts =
          existingCustom.length > 0 ? existingCustom : INITIAL_PRODUCTS;

        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(finalProducts));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        return finalProducts;
      }

      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // If parsed is empty, ensure the user has products available on fresh deployment
        if (parsed.length === 0 && !localStorage.getItem('fusion_pos_cleared_by_user')) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
          return INITIAL_PRODUCTS;
        }
        return parsed;
      }
      return INITIAL_PRODUCTS;
    } catch (e) {
      console.error('Error reading products from storage:', e);
      return INITIAL_PRODUCTS;
    }
  },

  setProducts(products) {
    try {
      const clean = Array.isArray(products) ? products : [];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(clean));
      if (clean.length === 0) {
        localStorage.setItem('fusion_pos_cleared_by_user', 'true');
      } else {
        localStorage.removeItem('fusion_pos_cleared_by_user');
      }
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  },

  resetToDefaultProducts() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.removeItem('fusion_pos_cleared_by_user');
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
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
