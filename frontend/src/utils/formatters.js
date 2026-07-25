// ==========================================
// Business Currency & Number Formatters
// ==========================================

/**
 * Format currency in Indian Rupees (INR) using Indian numbering system (lakhs & crores).
 * Example: 1250000 -> "₹12,50,000"
 * @param {number} amount 
 * @returns {string} Formatted INR string
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string into readable restock date.
 * Example: "2026-08-05" -> "Aug 5, 2026"
 * @param {string} dateStr 
 * @returns {string} Formatted date string
 */
export function formatRestockDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

