import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { BillingPage } from '../pages/BillingPage';
import { ProductsPage } from '../pages/ProductsPage';
import { SalesHistoryPage } from '../pages/SalesHistoryPage';
import { KhataPage } from '../pages/KhataPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<BillingPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="khata" element={<KhataPage />} />
        <Route path="customers" element={<KhataPage />} />
        <Route path="ledger" element={<KhataPage />} />
        <Route path="sales" element={<SalesHistoryPage />} />
        <Route path="orders" element={<SalesHistoryPage />} />
        <Route path="history" element={<SalesHistoryPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="*" element={<Navigate to="/billing" replace />} />
      </Route>
    </Routes>
  );
};
