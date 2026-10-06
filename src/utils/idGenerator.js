/**
 * Generates unique readable Order ID (e.g. ORD-20261005-4921)
 */
export const generateOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}${month}${day}-${randomSuffix}`;
};

/**
 * Generates unique SKU (e.g. SKU-CAT-8291)
 */
export const generateSku = (category = 'GEN') => {
  const prefix = (category.substring(0, 3) || 'GEN').toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SKU-${prefix}-${randomNum}`;
};

/**
 * Generates a short random entity ID
 */
export const generateId = (prefix = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};
