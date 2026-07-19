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
