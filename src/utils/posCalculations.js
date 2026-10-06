/**
 * Centralized POS Business Calculations
 */

/**
 * Calculates cart subtotal, tax, discount, and total
 * @param {Array} items - List of cart items { price, quantity }
 * @param {number} taxRate - Tax rate percentage (e.g. 8 for 8%)
 * @param {number} discountRate - Optional discount percentage
 * @returns {Object} { subtotal, tax, discount, grandTotal, totalItemCount }
 */
export const calculateCartTotals = (items = [], taxRate = 8, discountRate = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const totalItemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const discount = (subtotal * (Number(discountRate) || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = (taxableAmount * (Number(taxRate) || 0)) / 100;
  const grandTotal = taxableAmount + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    totalItemCount,
  };
};

/**
 * Calculates stock status based on stock count and threshold
 * @param {number} stock
 * @param {number} threshold
 * @returns {'in_stock'|'low_stock'|'out_of_stock'}
 */
export const calculateStockStatus = (stock, threshold = 10) => {
  const qty = Number(stock) || 0;
  const th = Number(threshold) || 10;
  if (qty <= 0) return 'out_of_stock';
  if (qty <= th) return 'low_stock';
  return 'in_stock';
};

/**
 * Computes dashboard aggregate metrics from orders and product list
 * @param {Array} orders
 * @param {Array} products
 */
export const calculateDashboardStats = (orders = [], products = []) => {
  const totalOrders = orders.length;

  const totalSales = orders.reduce((sum, o) => {
    return sum + (Number(o?.pricing?.total || o?.total) || 0);
  }, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => {
    const oDate = (o.createdAt || '').split('T')[0];
    return oDate === todayStr;
  });

  const todaySales = todayOrders.reduce((sum, o) => {
    return sum + (Number(o?.pricing?.total || o?.total) || 0);
  }, 0);

  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalProducts = products.length;

  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((p) => {
    const status = calculateStockStatus(p.stock, p.threshold || 10);
    if (status === 'out_of_stock') outOfStockCount += 1;
    else if (status === 'low_stock') lowStockCount += 1;
  });

  return {
    totalSales,
    todaySales,
    totalOrders,
    todayOrdersCount: todayOrders.length,
    avgOrderValue,
    totalProducts,
    lowStockCount,
    outOfStockCount,
  };
};

/**
 * Computes top selling products from orders
 * @param {Array} orders
 * @param {number} limit
 */
export const calculateTopSellingProducts = (orders = [], limit = 5) => {
  const map = {};

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const id = item.productId || item.id || item.name;
      if (!map[id]) {
        map[id] = {
          id,
          name: item.name,
          category: item.category || 'General',
          price: item.price,
          image: item.image,
          totalQtySold: 0,
          totalRevenue: 0,
        };
      }
      const q = Number(item.quantity) || 0;
      map[id].totalQtySold += q;
      map[id].totalRevenue += q * (Number(item.price) || 0);
    });
  });

  return Object.values(map)
    .sort((a, b) => b.totalQtySold - a.totalQtySold)
    .slice(0, limit);
};

/**
 * Computes daily sales trend for the last 7 days
 * @param {Array} orders
 */
export const calculateDailySalesTrend = (orders = []) => {
  const days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({ date: dateStr, label: dayLabel, sales: 0, orders: 0 });
  }

  orders.forEach((o) => {
    const orderDate = (o.createdAt || '').split('T')[0];
    const match = days.find((d) => d.date === orderDate);
    if (match) {
      match.sales += Number(o?.pricing?.total || o?.total) || 0;
      match.orders += 1;
    }
  });

  return days;
};
