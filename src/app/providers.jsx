'use client';

import { AuthProvider } from '../context/AuthContext';
import { StoreProvider } from '../context/StoreContext';
import { CartProvider } from '../context/CartContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

