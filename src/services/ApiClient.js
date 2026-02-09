/**
 * ApiClient - Unified HTTP Client with Caching & Deduplication
 * 
 * Smart Data-Flow Principles:
 * 1. Single instance (singleton pattern)
 * 2. Request deduplication - prevents duplicate concurrent requests
 * 3. Response caching - reduces unnecessary API calls
 * 4. Centralized error handling
 * 5. Authentication token management
 * 6. Request/response interceptors
 */

class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    this.cache = new Map(); // Response cache
    this.pendingRequests = new Map(); // Request deduplication map
    this.authToken = null;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Generate cache key from URL and options
   */
  _getCacheKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Get cached response if available and not expired
   */
  _getFromCache(cacheKey, maxAge = 60000) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Store response in cache
   */
  _setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache for specific pattern
   */
  clearCache(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Build headers with authentication
   */
  _buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Core request method with deduplication and caching
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers: customHeaders,
      cache: useCache = method === 'GET',
      cacheMaxAge = 60000, // 1 minute default
      ...fetchOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this._getCacheKey(url, { method, body });

    // Check cache for GET requests
    if (useCache && method === 'GET') {
      const cached = this._getFromCache(cacheKey, cacheMaxAge);
      if (cached) {
        return cached;
      }
    }

    // Request deduplication - if same request is pending, return that promise
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Create request promise
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, {
          method,
          headers: this._buildHeaders(customHeaders),
          body: body ? JSON.stringify(body) : undefined,
          ...fetchOptions
        });

        // Handle HTTP errors
        if (!response.ok) {
          const error = await response.json().catch(() => ({
            message: response.statusText
          }));
          throw new ApiError(
            error.message || `HTTP ${response.status}`,
            response.status,
            error
          );
        }

        const data = await response.json();

        // Cache successful GET responses
        if (useCache && method === 'GET') {
          this._setCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError(
          error.message || 'Network request failed',
          0,
          error
        );
      } finally {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
      }
    })();

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  /**
   * Convenience methods
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiError };
