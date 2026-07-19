// ==========================================
// Users Management API Client (Administrator Only)
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

export async function getUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    handleAuthError(response);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch users');
    return data;
  } catch (err) {
    handleNetworkError(err);
  }
}

export async function updateUserStatus(userId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    handleAuthError(response);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update status');
    return data;
  } catch (err) {
    handleNetworkError(err);
  }
}

export async function updateUserRole(userId, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    handleAuthError(response);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update role');
    return data;
  } catch (err) {
    handleNetworkError(err);
  }
}

export async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    handleAuthError(response);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to delete user');
    return data;
  } catch (err) {
    handleNetworkError(err);
  }
}
