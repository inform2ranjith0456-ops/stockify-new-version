/**
 * STOCKIFY Unified API Client
 * Automatically attaches JWT authentication bearer token
 * and handles API responses.
 */

// STOCKIFY production backend
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://stockify-new-version.onrender.com/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('stockify_auth_token');

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const response = await fetch(url, config);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(
          data.message || `Request failed with status ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
      }

      return data;
    } catch (error) {
      console.error(
        `API [${config.method || 'GET'}] ${url} error:`,
        error.message
      );

      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};

export default api;