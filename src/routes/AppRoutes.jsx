import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { BillingPage } from '../pages/BillingPage';
import { ProductsPage } from '../pages/ProductsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<BillingPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="*" element={<Navigate to="/billing" replace />} />
      </Route>
    </Routes>
  );
};
