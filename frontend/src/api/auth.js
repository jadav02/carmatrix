// ==========================================
// Authentication API Client
// ==========================================
// Integrates with backend FastAPI endpoints:
//   - POST /api/auth/register
//   - POST /api/auth/login
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Register a new user account.
 * @param {Object} userData - { name, email, password, role }
 */
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Registration failed. Please try again.');
  }

  return data;
}

/**
 * Login user and retrieve JWT access token.
 * @param {Object} credentials - { email, password }
 */
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Login failed. Please check your credentials.');
  }

  return data;
}
