// ==========================================
// Vehicle API Client
// ==========================================
// Integrates with backend FastAPI endpoints:
//   - GET    /api/vehicles/
//   - GET    /api/vehicles/summary
//   - GET    /api/vehicles/:id
//   - POST   /api/vehicles/
//   - PUT    /api/vehicles/:id
//   - DELETE /api/vehicles/:id
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
 * Get all vehicles with optional filters
 */
export async function getVehicles(filters = {}) {
  const queryParams = new URLSearchParams();
  
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
  if (filters.min_price) queryParams.append('min_price', filters.min_price);
  if (filters.max_price) queryParams.append('max_price', filters.max_price);
  if (filters.in_stock_only) queryParams.append('in_stock_only', 'true');

  const url = `${API_BASE_URL}/vehicles/?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch vehicles');
  }

  return data;
}

/**
 * Get inventory statistics summary
 */
export async function getInventorySummary() {
  const response = await fetch(`${API_BASE_URL}/vehicles/summary`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch inventory summary');
  }

  return data;
}

/**
 * Get vehicle by ID
 */
export async function getVehicleById(id) {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch vehicle details');
  }

  return data;
}

/**
 * Create a new vehicle
 */
export async function createVehicle(vehicleData) {
  const response = await fetch(`${API_BASE_URL}/vehicles/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(vehicleData),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    if (Array.isArray(data.detail)) {
      throw new Error(data.detail.map(e => e.msg).join(', '));
    }
    throw new Error(data.detail || 'Failed to create vehicle');
  }

  return data;
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(id, vehicleData) {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(vehicleData),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    if (Array.isArray(data.detail)) {
      throw new Error(data.detail.map(e => e.msg).join(', '));
    }
    throw new Error(data.detail || 'Failed to update vehicle');
  }

  return data;
}

/**
 * Delete a vehicle by ID
 */
export async function deleteVehicle(id) {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  handleAuthError(response);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to delete vehicle');
  }

  return data;
}
