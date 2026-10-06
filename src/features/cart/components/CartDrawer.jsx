import { useState } from 'react';
import { Drawer } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { CheckoutModal } from './CheckoutModal';
import { OrderSuccessModal } from './OrderSuccessModal';
import { useCart } from '../../../hooks/useCart';

export const CartDrawer = () => {
  const {
    items,
    totals,
    isOpen,
    taxRate,
    discountRate,
    setDiscountRate,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    processCheckout,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    completedOrder,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
  } = useCart();

  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={closeCart}
        title="POS Shopping Cart"
        subtitle={`${totals.totalItemCount} items selected`}
        width="max-w-md"
        footer={
          items.length > 0 ? (
            <div className="space-y-4">
              <CartSummary
                totals={totals}
                taxRate={taxRate}
                discountRate={discountRate}
                onDiscountChange={setDiscountRate}
              />
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsClearConfirmOpen(true)}
                  className="w-1/3"
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon="checkout"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-2/3 shadow-md shadow-indigo-200"
                >
                  Checkout
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {items.length === 0 ? (
          <EmptyState
            icon="cart"
            title="Your cart is empty"
            description="Select products from the catalog to build an order and proceed to checkout."
            actionLabel="Browse Products"
            onAction={closeCart}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </Drawer>

      {/* Confirmation to clear cart */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={() => {
          clearCart();
          setIsClearConfirmOpen(false);
        }}
        title="Clear Current Cart?"
        description="This will remove all items currently selected in the POS cart."
        confirmText="Yes, Clear Cart"
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        totals={totals}
        onConfirmCheckout={processCheckout}
      />

      {/* Order Success & Receipt Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        order={completedOrder}
      />
    </>
  );
};
