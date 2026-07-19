// ==========================================
// Inventory API Client
// ==========================================
// Integrates with backend FastAPI endpoints:
//   - POST /api/inventory/purchase
//   - POST /api/inventory/restock
//   - GET  /api/inventory
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('car_dealership_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

function handleAuthError(response) {
  if (response.status === 401) {
    localStorage.removeItem('car_dealership_token');
    localStorage.removeItem('car_dealership_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

/**
 * Purchase/sell vehicle stock (decreases quantity)
 * @param {number} vehicle_id 
 * @param {number} quantity 
 */
export async function purchaseStock(vehicle_id, quantity) {
  const response = await fetch(`${API_BASE_URL}/inventory/purchase`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ vehicle_id: Number(vehicle_id), quantity: Number(quantity) }),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    if (Array.isArray(data.detail)) {
      throw new Error(data.detail.map(e => e.msg).join(', '));
    }
    throw new Error(data.detail || 'Purchase failed');
  }

  return data;
}

/**
 * Restock vehicle stock (increases quantity)
 * @param {number} vehicle_id 
 * @param {number} quantity 
 */
export async function restockStock(vehicle_id, quantity) {
  const response = await fetch(`${API_BASE_URL}/inventory/restock`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ vehicle_id: Number(vehicle_id), quantity: Number(quantity) }),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    if (Array.isArray(data.detail)) {
      throw new Error(data.detail.map(e => e.msg).join(', '));
    }
    throw new Error(data.detail || 'Restock failed');
  }

  return data;
}

/**
 * Get current inventory list
 */
export async function getInventory() {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch inventory');
  }

  return data;
}
