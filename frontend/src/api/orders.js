// ==========================================
// Orders API Client for Customer Checkout & Purchase History
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

function handleNetworkError(err) {
  if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
    throw new Error('Unable to connect to CarMatrix server. Please ensure backend server is running on http://localhost:8000.');
  }
  throw err;
}

export async function checkout(checkoutData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(checkoutData),
    });
    handleAuthError(response);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Checkout failed.');
    return data;
  } catch (err) {
    handleNetworkError(err);
  }
}

export async function getMyOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    handleAuthError(response);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch purchase history.');
    return data;
  } catch (err) {
    handleNetworkError(err);
  }
}

export async function getAllOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    handleAuthError(response);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch all orders.');
    return data;
  } catch (err) {
    handleNetworkError(err);
  }
}
