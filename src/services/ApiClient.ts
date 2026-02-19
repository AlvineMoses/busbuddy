/**
 * ApiClient - Unified HTTP Client with Caching, Deduplication & Auto-Prefix
 *
 * SMART DATA-FLOW Principles:
 * ─────────────────────────────
 * 1. SINGLETON — One instance shared across the entire app. Import `apiClient`.
 * 2. AUTO-PREFIX — Endpoints in apiEndpoints.ts are defined WITHOUT `/api`.
 *    ApiClient prepends the prefix automatically so services stay clean.
 * 3. REQUEST DEDUPLICATION — Identical concurrent GETs collapse into one fetch.
 * 4. RESPONSE CACHING — GET responses cached with configurable TTL.
 * 5. CENTRALIZED ERROR HANDLING — All HTTP errors wrapped in ApiError.
 * 6. TOKEN MANAGEMENT — Auth token injected into every request header.
 * 7. REQUEST/RESPONSE INTERCEPTORS — Extensible middleware chain.
 * 8. RETRY LOGIC — Configurable retries for transient failures (5xx, network).
 * 9. CACHE INVALIDATION — Pattern-based or entity-scoped cache clearing.
 *
 * Usage:
 *   import { apiClient } from '@/src/services/ApiClient';
 *   const data = await apiClient.get('/schools');         // → fetches <baseURL>/api/schools
 *   const item = await apiClient.post('/drivers', body);  // → POST <baseURL>/api/drivers
 */

// ============================================
// TYPES
// ============================================

export interface CacheTTL {
  SHORT: number;
  MEDIUM: number;
  LONG: number;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  [key: string]: unknown;
}

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown> | unknown[];
  headers?: Record<string, string>;
  cache?: boolean;
  cacheMaxAge?: number;
  retry?: number;
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

interface RequestMeta {
  cacheKey: string;
  useCache: boolean;
  method: string;
  retry: number;
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (data: unknown) => unknown | Promise<unknown>;

// ============================================
// DEFAULT CACHE TTLs (milliseconds)
// ============================================
export const CACHE_TTL: CacheTTL = {
  SHORT:  60_000,     // 1 min  — trips, live data
  MEDIUM: 300_000,    // 5 min  — drivers, routes, schools
  LONG:   900_000,    // 15 min — settings, permissions
};

// ============================================
// API ERROR
// ============================================

/**
 * Custom error class that preserves HTTP status and server-provided details.
 * Every rejected request from ApiClient throws an ApiError.
 */
export class ApiError extends Error {
  public readonly name = 'ApiError';
  public readonly status: number;
  public readonly details: unknown;
  public readonly timestamp: number;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    this.timestamp = Date.now();
  }

  /** True for 401/403 — useful for auth redirect logic */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** True for 5xx or network failures — candidates for retry */
  get isRetryable(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

// ============================================
// API CLIENT
// ============================================

class ApiClient {
  public baseURL: string;
  public apiPrefix: string;

  private cache: Map<string, CacheEntry>;
  private pendingRequests: Map<string, Promise<unknown>>;
  private authToken: string | null;
  private _requestInterceptors: RequestInterceptor[];
  private _responseInterceptors: ResponseInterceptor[];
  private defaultCacheMaxAge: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor() {
    this.baseURL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL || 'https://corporate.little.africa/new_backend';
    this.apiPrefix = ''; // Backend endpoints already include /api/v1 prefix

    this.cache = new Map();
    this.pendingRequests = new Map();
    this.authToken = null;

    this._requestInterceptors = [];
    this._responseInterceptors = [];

    this.defaultCacheMaxAge = CACHE_TTL.MEDIUM;
    this.maxRetries = 1;
    this.retryDelay = 1000;
  }

  // ──────────────────────────────────────────
  // AUTH TOKEN MANAGEMENT
  // ──────────────────────────────────────────

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // ──────────────────────────────────────────
  // INTERCEPTORS
  // ──────────────────────────────────────────

  addRequestInterceptor(fn: RequestInterceptor): () => void {
    this._requestInterceptors.push(fn);
    return () => {
      this._requestInterceptors = this._requestInterceptors.filter(i => i !== fn);
    };
  }

  addResponseInterceptor(fn: ResponseInterceptor): () => void {
    this._responseInterceptors.push(fn);
    return () => {
      this._responseInterceptors = this._responseInterceptors.filter(i => i !== fn);
    };
  }

  // ──────────────────────────────────────────
  // URL BUILDING
  // ──────────────────────────────────────────

  private _buildUrl(endpoint: string): string {
    if (endpoint.startsWith(this.apiPrefix)) {
      return `${this.baseURL}${endpoint}`;
    }
    return `${this.baseURL}${this.apiPrefix}${endpoint}`;
  }

  // ──────────────────────────────────────────
  // CACHE MANAGEMENT
  // ──────────────────────────────────────────

  private _getCacheKey(url: string, options: Partial<RequestOptions> = {}): string {
    const method = options.method || 'GET';
    const body = options.body
      ? JSON.stringify(options.body, Object.keys(options.body as Record<string, unknown>).sort())
      : '';
    const params = options.params
      ? JSON.stringify(options.params, Object.keys(options.params).sort())
      : '';
    return `${method}:${url}:${params}:${body}`;
  }

  private _getFromCache(cacheKey: string, maxAge: number): unknown | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > maxAge) {
      this.cache.delete(cacheKey);
      return null;
    }
    return cached.data;
  }

  private _setCache(cacheKey: string, data: unknown): void {
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  clearCache(pattern?: string): void {
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

  getCacheStats(): { size: number; keys: string[]; pendingRequests: number } {
    return {
      size: this.cache.size,
      keys: [...this.cache.keys()],
      pendingRequests: this.pendingRequests.size,
    };
  }

  // ──────────────────────────────────────────
  // HEADERS
  // ──────────────────────────────────────────

  private _buildHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // ──────────────────────────────────────────
  // CORE REQUEST
  // ──────────────────────────────────────────

  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers: customHeaders,
      cache: useCache = method === 'GET',
      cacheMaxAge = this.defaultCacheMaxAge,
      retry = method === 'GET' ? this.maxRetries : 0,
      ...fetchOptions
    } = options;

    const url = this._buildUrl(endpoint);
    const cacheKey = this._getCacheKey(url, { method, body });

    // 1. Cache check
    if (useCache && method === 'GET') {
      const cached = this._getFromCache(cacheKey, cacheMaxAge);
      if (cached) return cached as T;
    }

    // 2. Deduplication
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // 3. Build request config
    let requestConfig: RequestConfig = {
      url,
      method,
      headers: this._buildHeaders(customHeaders as Record<string, string>),
      body: body ? JSON.stringify(body) : undefined,
      ...fetchOptions,
    };

    // Apply request interceptors
    for (const interceptor of this._requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }

    // 4. Execute with retry
    const requestPromise = this._executeWithRetry<T>(requestConfig, {
      cacheKey,
      useCache,
      method,
      retry,
    });

    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  private async _executeWithRetry<T>(config: RequestConfig, meta: RequestMeta, attempt = 0): Promise<T> {
    try {
      const { url, method, headers, body, ...rest } = config;

      const response = await fetch(url, { method, headers, body, ...rest } as RequestInit);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
          message: response.statusText,
        }));
        throw new ApiError(
          errorBody.message || `HTTP ${response.status}`,
          response.status,
          errorBody
        );
      }

      let data: unknown = await response.json();

      // Apply response interceptors
      for (const interceptor of this._responseInterceptors) {
        data = await interceptor(data);
      }

      // Cache successful GET responses
      if (meta.useCache && meta.method === 'GET') {
        this._setCache(meta.cacheKey, data);
      }

      return data as T;
    } catch (error) {
      const apiErr = error instanceof ApiError ? error : new ApiError(
        (error as Error).message || 'Network request failed', 0, error
      );

      if (apiErr.isRetryable && attempt < meta.retry) {
        await new Promise(r => setTimeout(r, this.retryDelay * (attempt + 1)));
        return this._executeWithRetry<T>(config, meta, attempt + 1);
      }

      throw apiErr;
    } finally {
      if (attempt >= meta.retry || attempt === 0) {
        try { this.pendingRequests.delete(meta.cacheKey); }
        catch { /* safe cleanup */ }
      }
    }
  }

  // ──────────────────────────────────────────
  // CONVENIENCE METHODS
  // ──────────────────────────────────────────

  get<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = unknown>(endpoint: string, data?: Record<string, unknown> | unknown[], options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }

  put<T = unknown>(endpoint: string, data?: Record<string, unknown> | unknown[], options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  patch<T = unknown>(endpoint: string, data?: Record<string, unknown> | unknown[], options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: data });
  }

  delete<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async upload<T = unknown>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> {
    const url = this._buildUrl(endpoint);
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      ...options,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(err.message || `Upload failed (${response.status})`, response.status, err);
    }

    return response.json() as Promise<T>;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================
export const apiClient = new ApiClient();
