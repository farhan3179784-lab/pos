import { storageService } from './storage.service';
import {
  calculateDashboardStats,
  calculateTopSellingProducts,
  calculateDailySalesTrend,
  calculateStockStatus,
} from '../utils/posCalculations';

export const dashboardService = {
  async getDashboardData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = storageService.getProducts();
        const orders = storageService.getOrders();

        const stats = calculateDashboardStats(orders, products);
        const salesTrend = calculateDailySalesTrend(orders);
        const topProducts = calculateTopSellingProducts(orders, 5);
        const recentOrders = orders.slice(0, 5);

        const lowStockItems = products
          .filter((p) => {
            const status = calculateStockStatus(p.stock, p.threshold);
            return status === 'low_stock' || status === 'out_of_stock';
          })
          .slice(0, 5);

        resolve({
          stats,
          salesTrend,
          topProducts,
          recentOrders,
          lowStockItems,
        });
      }, 50);
    });
  },
};
