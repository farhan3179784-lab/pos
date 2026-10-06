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

  // Add Item with strict stock check and unit awareness
  const addItem = (product, quantityToAdd = 1, options = {}) => {
    const liveProduct = products.find((p) => p.id === product.id) || product;
    const availableStock = Number(liveProduct.stock) || 0;
    const unit = options.unit || product.unit || 'pcs';
    const numQtyToAdd = Math.round(Number(quantityToAdd) * 1000) / 1000;

    if (availableStock <= 0) {
      alert(`"${liveProduct.name}" is currently out of stock.`);
      return false;
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = options.replaceQuantity
          ? numQtyToAdd
          : Math.round((currentQty + numQtyToAdd) * 1000) / 1000;

        if (newQty > availableStock) {
          alert(`Cannot add more. Only ${availableStock} ${unit} available in stock.`);
          return prevItems;
        }

        const price = Number(prevItems[existingIndex].price) || 0;
        const subtotal = options.calculatedTotal !== undefined
          ? options.calculatedTotal
          : Math.round(newQty * price);

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          unit,
          subtotal,
        };
        return updated;
      } else {
        if (numQtyToAdd > availableStock) {
          alert(`Cannot add ${numQtyToAdd} ${unit}. Only ${availableStock} available.`);
          return prevItems;
        }

        const price = Number(product.price) || 0;
        const subtotal = options.calculatedTotal !== undefined
          ? options.calculatedTotal
          : Math.round(numQtyToAdd * price);

        return [
          ...prevItems,
          {
            id: product.id,
            productId: product.id,
            name: product.name,
            nameUrdu: product.nameUrdu || product.name,
            sku: product.sku,
            category: product.category,
            unit,
            price,
            quantity: numQtyToAdd,
            subtotal,
            image: product.image,
            maxStock: availableStock,
          },
        ];
      }
    });

    if (options.openCart === true) {
      setIsOpen(true);
    }
    return true;
  };

  // Update item quantity (supports decimals/weights)
  const updateQuantity = (productId, newQuantity) => {
    const cleanQty = Math.round(Number(newQuantity) * 1000) / 1000;
    if (cleanQty <= 0) {
      removeItem(productId);
      return;
    }

    const liveProduct = products.find((p) => p.id === productId);
    const availableStock = liveProduct ? Number(liveProduct.stock) : 999;

    if (cleanQty > availableStock) {
      alert(`Cannot set quantity to ${cleanQty}. Only ${availableStock} available in stock.`);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            quantity: cleanQty,
            subtotal: Math.round(cleanQty * item.price),
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
          unit: it.unit || 'pcs',
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
