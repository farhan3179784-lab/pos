/**
 * Formats ISO date string to readable Date format
 * @param {string|Date} date
 * @returns {string} e.g. "Oct 5, 2026"
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats ISO date string to Date + Time format
 * @param {string|Date} date
 * @returns {string} e.g. "Oct 5, 2026, 2:30 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats time only
 * @param {string|Date} date
 * @returns {string} e.g. "2:30 PM"
 */
export const formatTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
