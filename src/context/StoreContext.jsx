import { createContext, useState, useCallback } from 'react';
import { storageService } from '../services/storage.service';
import { productService } from '../services/product.service';
import { orderService } from '../services/order.service';
import { inventoryService } from '../services/inventory.service';

export const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(() => storageService.getProducts());
  const [orders, setOrders] = useState(() => storageService.getOrders());
  const [inventoryLogs, setInventoryLogs] = useState(() => storageService.getInventoryLogs());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedProducts, fetchedOrders, fetchedLogs] = await Promise.all([
        productService.getAll(),
        orderService.getAll(),
        inventoryService.getLogs(),
      ]);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      setInventoryLogs(fetchedLogs);
    } catch (err) {
      console.error('Error loading store data:', err);
      setError(err.message || 'Failed to load store data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save/Update Product
  const saveProduct = async (productData) => {
    const saved = await productService.save(productData);
    await loadData();
    return saved;
  };

  // Delete Product
  const deleteProduct = async (productId) => {
    await productService.delete(productId);
    await loadData();
  };

  // Adjust Inventory Stock
  const adjustStock = async ({ productId, delta, reason }) => {
    const res = await inventoryService.adjustStock({ productId, delta, reason });
    await loadData();
    return res;
  };

  // Create Order from Checkout
  const createOrder = async ({ items, pricing, payment, customer }) => {
    const order = await orderService.createOrder({ items, pricing, payment, customer });
    await loadData();
    return order;
  };

  // Reset / reload default products
  const resetProducts = async () => {
    storageService.resetToDefaultProducts();
    await loadData();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        inventoryLogs,
        isLoading,
        error,
        refreshData: loadData,
        saveProduct,
        deleteProduct,
        adjustStock,
        createOrder,
        resetProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
