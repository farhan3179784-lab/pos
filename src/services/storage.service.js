import { INITIAL_PRODUCTS } from '../data/mock/mockProducts';
import { INITIAL_ORDERS } from '../data/mock/mockOrders';
import { INITIAL_INVENTORY_LOGS } from '../data/mock/mockInventory';

const STORAGE_KEYS = {
  PRODUCTS: 'superstore_pos_products_v2',
  ORDERS: 'superstore_pos_orders_v2',
  INVENTORY_LOGS: 'superstore_pos_inventory_logs_v2',
};

export const storageService = {
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  setProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  },

  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        return INITIAL_ORDERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ORDERS;
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
        localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(INITIAL_INVENTORY_LOGS));
        return INITIAL_INVENTORY_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_INVENTORY_LOGS;
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
