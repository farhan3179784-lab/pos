import { createContext, useState, useCallback } from 'react';
import { storageService } from '../services/storage.service';
import { productService } from '../services/product.service';
import { orderService } from '../services/order.service';
import { inventoryService } from '../services/inventory.service';
import { customerService } from '../services/customer.service';

export const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(() => storageService.getProducts());
  const [orders, setOrders] = useState(() => storageService.getOrders());
  const [inventoryLogs, setInventoryLogs] = useState(() => storageService.getInventoryLogs());
  const [customers, setCustomers] = useState(() => storageService.getCustomers());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedProducts, fetchedOrders, fetchedLogs, fetchedCustomers] = await Promise.all([
        productService.getAll(),
        orderService.getAll(),
        inventoryService.getLogs(),
        customerService.getAll(),
      ]);
      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      setInventoryLogs(fetchedLogs);
      setCustomers(fetchedCustomers);
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

  // Save/Update Customer
  const saveCustomer = async (customerData) => {
    const saved = await customerService.save(customerData);
    await loadData();
    return saved;
  };

  // Delete Customer
  const deleteCustomer = async (customerId) => {
    await customerService.delete(customerId);
    await loadData();
  };

  // Record payment to Khata (کیش وصولی / کھاتہ جمع)
  const recordCustomerPayment = async ({ customerId, amount, note, paymentMethod }) => {
    const res = await customerService.recordPayment({ customerId, amount, note, paymentMethod });
    await loadData();
    return res;
  };

  // Create Order from Checkout & handle automatic Khata updating
  const createOrder = async ({ id, createdAt, items, pricing, payment, customer }) => {
    // 1. Create order record & update product inventory
    const order = await orderService.createOrder({ id, createdAt, items, pricing, payment, customer });

    // 2. If there's an outstanding remaining amount or customer is specified for Khata tracking:
    const remainingDue = Number(payment?.remaining) || 0;
    const isNamedCustomer = customer && customer.name && !customer.name.startsWith('Walk-in');

    if (remainingDue > 0 && isNamedCustomer) {
      await customerService.recordBillCredit({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        orderId: order.id,
        billTotal: pricing.grandTotal,
        paidAmount: payment.tendered || (pricing.grandTotal - remainingDue),
        creditAmount: remainingDue,
      });
    }

    await loadData();
    return order;
  };

  // Reset / reload default products
  const resetProducts = async () => {
    storageService.resetToDefaultProducts();
    await loadData();
  };

  // Reset / reload default customers
  const resetCustomers = async () => {
    storageService.resetToDefaultCustomers();
    await loadData();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        inventoryLogs,
        customers,
        isLoading,
        error,
        refreshData: loadData,
        saveProduct,
        deleteProduct,
        adjustStock,
        createOrder,
        saveCustomer,
        deleteCustomer,
        recordCustomerPayment,
        resetProducts,
        resetCustomers,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
