/**
 * Format numerical amount to standard Pakistani Rupee (PKR / Rs.) currency string.
 * @param {number|string} amount
 * @returns {string} e.g. "Rs. 1,320"
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return 'Rs. 0';
  return `Rs. ${new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(num))}`;
};

/**
 * Format quantity with thousand separators
 * @param {number|string} quantity
 * @returns {string}
 */
export const formatNumber = (quantity) => {
  const num = Number(quantity);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-PK').format(num);
};
