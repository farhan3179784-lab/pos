import { createContext, useState, useMemo } from 'react';
import { calculateCartTotals } from '../utils/posCalculations';
import { useStore } from '../hooks/useStore';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { products, createOrder } = useStore();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [taxRate] = useState(8); // 8% sales tax
  const [discountRate, setDiscountRate] = useState(0);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Derived totals using centralized utility
  const totals = useMemo(() => {
    return calculateCartTotals(items, taxRate, discountRate);
  }, [items, taxRate, discountRate]);

  // Open & Close controls
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Add Item with strict stock check
  const addItem = (product, quantityToAdd = 1) => {
    const liveProduct = products.find((p) => p.id === product.id) || product;
    const availableStock = liveProduct.stock ?? 0;

    if (availableStock <= 0) {
      alert(`"${liveProduct.name}" is currently out of stock.`);
      return false;
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = currentQty + quantityToAdd;

        if (newQty > availableStock) {
          alert(`Cannot add more. Only ${availableStock} units available in stock.`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: Math.round(newQty * updated[existingIndex].price * 100) / 100,
        };
        return updated;
      } else {
        if (quantityToAdd > availableStock) {
          alert(`Cannot add ${quantityToAdd}. Only ${availableStock} units available.`);
          return prevItems;
        }

        return [
          ...prevItems,
          {
            id: product.id,
            productId: product.id,
            name: product.name,
            nameUrdu: product.nameUrdu || product.name,
            sku: product.sku,
            category: product.category,
            price: Number(product.price) || 0,
            quantity: quantityToAdd,
            subtotal: Math.round(Number(product.price) * quantityToAdd * 100) / 100,
            image: product.image,
            maxStock: availableStock,
          },
        ];
      }
    });

    setIsOpen(true);
    return true;
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const liveProduct = products.find((p) => p.id === productId);
    const availableStock = liveProduct ? liveProduct.stock : 999;

    if (newQuantity > availableStock) {
      alert(`Cannot set quantity to ${newQuantity}. Only ${availableStock} available in stock.`);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: Math.round(newQuantity * item.price * 100) / 100,
          };
        }
        return item;
      })
    );
  };

  // Remove single item
  const removeItem = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Checkout submission
  const processCheckout = async ({ paymentMethod, tendered = 0, customerName = 'Walk-in Customer' }) => {
    if (items.length === 0) return;

    try {
      const orderData = {
        items: items.map((it) => ({
          productId: it.id,
          name: it.name,
          nameUrdu: it.nameUrdu || it.name,
          sku: it.sku,
          category: it.category,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.subtotal,
          image: it.image,
        })),
        pricing: totals,
        payment: {
          method: paymentMethod,
          status: 'Paid',
          tendered: Number(tendered) || totals.grandTotal,
          change: Math.max(0, (Number(tendered) || totals.grandTotal) - totals.grandTotal),
        },
        customer: {
          name: customerName || 'Walk-in Customer',
          type: 'Walk-in',
        },
      };

      const created = await createOrder(orderData);
      clearCart();
      setIsOpen(false);
      setIsCheckoutModalOpen(false);
      setCompletedOrder(created);
      setIsSuccessModalOpen(true);
      return created;
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        isOpen,
        taxRate,
        discountRate,
        setDiscountRate,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        processCheckout,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        completedOrder,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
