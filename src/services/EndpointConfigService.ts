/**
 * EndpointConfigService
 * =====================
 * Manages endpoint environment configs, endpoint definitions, and configuration mappings.
 * Persists to localStorage and intelligently connects to apiEndpoints.ts + ApiClient.
 */

import { API } from '../config/apiEndpoints';
import { apiClient } from './ApiClient';
import type {
  EndpointEnvironment,
  EndpointDefinition,
  EndpointMapping,
  HttpMethod,
  EndpointStatus,
  EnvironmentType,
} from '../../types';

const STORAGE_KEY = 'busbuddy_endpoint_config';

// ============================================
// STORAGE HELPERS
// ============================================

interface EndpointConfigStore {
  environments: EndpointEnvironment[];
  endpoints: EndpointDefinition[];
  mappings: EndpointMapping[];
}

const getStore = (): EndpointConfigStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EndpointConfigStore;
  } catch { /* fallback */ }
  return { environments: [], endpoints: [], mappings: [] };
};

const saveStore = (store: EndpointConfigStore): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

// ============================================
// AUTO-DERIVE ENDPOINTS FROM apiEndpoints.ts
// ============================================

interface DerivedEndpoint {
  group: string;
  key: string;
  path: string;
  constant: string; // e.g. "API.AUTH.LOGIN"
  isDynamic: boolean;
}

/**
 * Introspects the API object from apiEndpoints.ts and extracts all
 * static endpoint paths + identifies dynamic ones (functions).
 */
export const deriveEndpointsFromConfig = (): DerivedEndpoint[] => {
  const derived: DerivedEndpoint[] = [];
  for (const [group, endpoints] of Object.entries(API)) {
    for (const [key, value] of Object.entries(endpoints as Record<string, unknown>)) {
      if (typeof value === 'string') {
        derived.push({
          group,
          key,
          path: value,
          constant: `API.${group}.${key}`,
          isDynamic: false,
        });
      } else if (typeof value === 'function') {
        // Call with placeholder to get the pattern
        try {
          const sample = (value as (id: string) => string)(':id');
          derived.push({
            group,
            key,
            path: sample,
            constant: `API.${group}.${key}(:id)`,
            isDynamic: true,
          });
        } catch {
          derived.push({
            group,
            key,
            path: `/${group.toLowerCase()}/:id/${key.toLowerCase()}`,
            constant: `API.${group}.${key}(:id)`,
            isDynamic: true,
          });
        }
      }
    }
  }
  return derived;
};

/**
 * Maps known endpoints → the pages/components/features using them.
 * This is derived from the codebase knowledge of UnifiedApiService.ts usage.
 */
const ENDPOINT_FUNCTIONALITY_MAP: Record<string, string> = {
  'API.AUTH.LOGIN': 'LoginPage — User authentication',
  'API.AUTH.LOGOUT': 'Layout — Session termination',
  'API.AUTH.ME': 'App — Current user fetch',
  'API.AUTH.VERIFY_OTP': 'LoginPage — OTP verification',
  'API.AUTH.RESEND_OTP_LOGIN': 'LoginPage — Resend OTP',
  'API.AUTH.FORGOT_PASSWORD': 'LoginPage — Password reset request',
  'API.AUTH.PREFERRED_OTP_CHANNEL': 'LoginPage — OTP channel preference',
  'API.AUTH.RESEND_OTP': 'LoginPage — Resend forgot-password OTP',
  'API.AUTH.RESET_PASSWORD': 'LoginPage — Password reset',
  'API.AUTH.REFRESH_TOKEN': 'ApiClient — Token refresh interceptor',
  'API.AUTH.USER_ACCOUNTS': 'LoginPage — Multi-account selection',
  'API.AUTH.VERIFY_ACCOUNT': 'LoginPage — Account verification',
  'API.SCHOOLS.BASE': 'SchoolsPage — CRUD operations',
  'API.SCHOOLS.BY_ID(:id)': 'SchoolsPage — School detail/edit',
  'API.SCHOOLS.STATS(:id)': 'Dashboard — School statistics',
  'API.DRIVERS.BASE': 'DriversPage — CRUD operations',
  'API.DRIVERS.BY_ID(:id)': 'DriversPage — Driver detail/edit',
  'API.DRIVERS.GENERATE_OTP(:id)': 'DriversPage — Driver OTP generation',
  'API.DRIVERS.QR_CODE(:id)': 'DriversPage — Driver QR code',
  'API.DRIVERS.STATUS(:id)': 'DriversPage — Driver status update',
  'API.DRIVERS.LIVE': 'OperationsPage — Live driver tracking',
  'API.ROUTES.BASE': 'RoutesPage — CRUD operations',
  'API.ROUTES.BY_ID(:id)': 'RoutesPage — Route detail/edit',
  'API.ROUTES.TRIPS(:id)': 'RoutesPage — Route trips list',
  'API.ROUTES.EXPORT': 'RoutesPage — Export routes data',
  'API.ROUTES.LIVE': 'OperationsPage — Live route tracking',
  'API.TRIPS.BASE': 'TripsPage — CRUD operations',
  'API.TRIPS.BY_ID(:id)': 'TripsPage — Trip detail/edit',
  'API.TRIPS.FLAG(:id)': 'TripsPage — Flag trip',
  'API.TRIPS.PLAYBACK(:id)': 'TripsPage — Trip playback',
  'API.TRIPS.EVENTS(:id)': 'TripsPage — Trip events timeline',
  'API.TRIPS.STATS': 'Dashboard — Trip statistics',
  'API.STUDENTS.BASE': 'StudentsPage — CRUD operations',
  'API.STUDENTS.BY_ID(:id)': 'StudentsPage — Student detail/edit',
  'API.STUDENTS.DISABLE(:id)': 'StudentsPage — Disable student',
  'API.STUDENTS.TRANSFER(:id)': 'StudentsPage — Transfer student',
  'API.STUDENTS.BULK_UPLOAD': 'StudentsPage — Bulk CSV upload',
  'API.ASSIGNMENTS.BASE': 'AssignmentsPage — CRUD operations',
  'API.ASSIGNMENTS.BY_ID(:id)': 'AssignmentsPage — Assignment detail/edit',
  'API.ASSIGNMENTS.CONFLICTS': 'AssignmentsPage — Conflict detection',
  'API.SHIFTS.BASE': 'ShiftsPage — CRUD operations',
  'API.SHIFTS.BY_ID(:id)': 'ShiftsPage — Shift detail/edit',
  'API.SHIFTS.DUPLICATE(:id)': 'ShiftsPage — Duplicate shift',
  'API.NOTIFICATIONS.BASE': 'NotificationsPage — List notifications',
  'API.NOTIFICATIONS.BY_ID(:id)': 'NotificationsPage — Notification detail',
  'API.NOTIFICATIONS.READ(:id)': 'NotificationsPage — Mark as read',
  'API.NOTIFICATIONS.READ_ALL': 'NotificationsPage — Mark all read',
  'API.NOTIFICATIONS.UNREAD_COUNT': 'Layout — Badge count',
  'API.SETTINGS.BASE': 'SettingsPage — App settings',
  'API.SETTINGS.UPLOAD_IMAGE': 'SettingsPage — Image upload',
  'API.SETTINGS.PERMISSIONS': 'SettingsPage — Permissions',
  'API.DASHBOARD.METRICS': 'Dashboard — Metrics overview',
  'API.DASHBOARD.LIVE_FEED': 'Dashboard — Live fleet feed',
};

// ============================================
// INFER HTTP METHOD FROM ENDPOINT KEY NAME
// ============================================

const inferMethod = (key: string): HttpMethod => {
  const upper = key.toUpperCase();
  if (upper.includes('CREATE') || upper.includes('LOGIN') || upper.includes('UPLOAD') || upper.includes('GENERATE') || upper.includes('VERIFY') || upper.includes('RESEND') || upper.includes('FORGOT') || upper.includes('RESET') || upper.includes('FLAG') || upper.includes('DUPLICATE') || upper.includes('BULK')) return 'POST';
  if (upper.includes('UPDATE') || upper.includes('STATUS') || upper === 'READ' || upper === 'READ_ALL') return 'PUT';
  if (upper.includes('DELETE') || upper.includes('DISABLE')) return 'DELETE';
  return 'GET';
};

// ============================================
// SERVICE METHODS
// ============================================

export const endpointConfigService = {
  // --------------- ENVIRONMENTS ---------------
  getEnvironments(): EndpointEnvironment[] {
    return getStore().environments;
  },

  saveEnvironment(env: Omit<EndpointEnvironment, 'id' | 'createdAt' | 'updatedAt'>): EndpointEnvironment {
    const store = getStore();
    const now = new Date().toISOString();
    const newEnv: EndpointEnvironment = {
      ...env,
      id: `env_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    store.environments.push(newEnv);
    saveStore(store);
    return newEnv;
  },

  updateEnvironment(id: string, updates: Partial<EndpointEnvironment>): EndpointEnvironment | null {
    const store = getStore();
    const idx = store.environments.findIndex(e => e.id === id);
    if (idx === -1) return null;
    store.environments[idx] = { ...store.environments[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStore(store);
    return store.environments[idx];
  },

  deleteEnvironment(id: string): boolean {
    const store = getStore();
    store.environments = store.environments.filter(e => e.id !== id);
    // Also remove endpoints tied to this env
    store.endpoints = store.endpoints.filter(ep => ep.environmentId !== id);
    saveStore(store);
    return true;
  },

  // --------------- ENDPOINTS ---------------
  getEndpoints(): EndpointDefinition[] {
    return getStore().endpoints;
  },

  /**
   * Returns system endpoints derived from apiEndpoints.ts as EndpointDefinition objects.
   * These are read-only and represent the built-in endpoint configuration.
   */
  getSystemEndpoints(): EndpointDefinition[] {
    const derived = deriveEndpointsFromConfig();
    return derived.map((d, idx) => ({
      id: `sys_${idx}`,
      environmentId: '',
      method: inferMethod(d.key) as HttpMethod,
      path: d.path,
      description: `${d.group} → ${d.key}${d.isDynamic ? ' (dynamic)' : ''}`,
      status: 'ACTIVE' as EndpointStatus,
      parameters: '',
      headers: '',
      body: '',
    }));
  },

  /**
   * Returns all endpoints: system (from apiEndpoints.ts) + user-created (from localStorage).
   */
  getAllEndpoints(): EndpointDefinition[] {
    return [...this.getSystemEndpoints(), ...this.getEndpoints()];
  },

  saveEndpoint(ep: Omit<EndpointDefinition, 'id'>): EndpointDefinition {
    const store = getStore();
    const newEp: EndpointDefinition = { ...ep, id: `ep_${Date.now()}` };
    store.endpoints.push(newEp);
    saveStore(store);
    return newEp;
  },

  updateEndpoint(id: string, updates: Partial<EndpointDefinition>): EndpointDefinition | null {
    const store = getStore();
    const idx = store.endpoints.findIndex(e => e.id === id);
    if (idx === -1) return null;
    store.endpoints[idx] = { ...store.endpoints[idx], ...updates };
    saveStore(store);
    return store.endpoints[idx];
  },

  deleteEndpoint(id: string): boolean {
    const store = getStore();
    store.endpoints = store.endpoints.filter(e => e.id !== id);
    saveStore(store);
    return true;
  },

  // --------------- CONFIGURATION MAPPINGS ---------------
  getMappings(): EndpointMapping[] {
    return getStore().mappings;
  },

  /**
   * Auto-generates configuration mappings from apiEndpoints.ts,
   * merging with any user-created custom mappings.
   */
  getAutoMappings(): EndpointMapping[] {
    const derived = deriveEndpointsFromConfig();
    return derived.map((d, idx) => ({
      id: `map_auto_${idx}`,
      endpointId: '',
      endpointPath: d.path,
      description: `${d.group} → ${d.key}`,
      functionality: ENDPOINT_FUNCTIONALITY_MAP[d.constant] || 'Not mapped',
      sourceConstant: d.constant,
    }));
  },

  saveMappings(mappings: EndpointMapping[]): void {
    const store = getStore();
    store.mappings = mappings;
    saveStore(store);
  },

  // --------------- TESTING ---------------
  async testEndpoint(
    method: HttpMethod,
    fullUrl: string,
    options?: { body?: string; headers?: Record<string, string> }
  ): Promise<{ status: number; data: unknown; duration: number }> {
    const start = performance.now();
    try {
      const fetchOpts: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      };
      if (options?.body && method !== 'GET') {
        fetchOpts.body = options.body;
      }
      const res = await fetch(fullUrl, fetchOpts);
      const data = await res.json().catch(() => res.text());
      return { status: res.status, data, duration: Math.round(performance.now() - start) };
    } catch (err: unknown) {
      return { status: 0, data: { error: (err as Error).message }, duration: Math.round(performance.now() - start) };
    }
  },

  // --------------- IMPORT / EXPORT ---------------
  exportConfig(): string {
    const store = getStore();
    const systemEndpoints = this.getSystemEndpoints();
    return JSON.stringify({
      ...store,
      systemEndpoints,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }, null, 2);
  },

  importConfig(json: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(json) as Partial<EndpointConfigStore>;
      const store = getStore();
      if (parsed.environments) store.environments = [...store.environments, ...parsed.environments];
      if (parsed.endpoints) store.endpoints = [...store.endpoints, ...parsed.endpoints];
      if (parsed.mappings) store.mappings = [...store.mappings, ...parsed.mappings];
      saveStore(store);
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  /**
   * Import from Postman collection JSON — extracts endpoints.
   */
  importFromPostman(json: string, environmentId: string): { success: boolean; count: number; error?: string } {
    try {
      const collection = JSON.parse(json);
      const store = getStore();
      let count = 0;

      const extractItems = (items: any[]): void => {
        for (const item of items) {
          if (item.item) {
            extractItems(item.item); // recurse folders
            continue;
          }
          if (item.request) {
            const req = item.request;
            const method = (typeof req.method === 'string' ? req.method : 'GET').toUpperCase() as HttpMethod;
            let path = '';
            if (typeof req.url === 'string') {
              path = req.url;
            } else if (req.url?.raw) {
              path = req.url.raw;
            } else if (req.url?.path) {
              path = '/' + (Array.isArray(req.url.path) ? req.url.path.join('/') : req.url.path);
            }
            // Strip base URL if present — keep only path
            try {
              const u = new URL(path);
              path = u.pathname + u.search;
            } catch {
              // already a relative path
            }

            const newEp: EndpointDefinition = {
              id: `ep_${Date.now()}_${count}`,
              method,
              environmentId,
              path,
              description: item.name || path,
              status: 'ACTIVE',
              parameters: req.url?.query ? JSON.stringify(req.url.query) : undefined,
              authentication: req.auth ? JSON.stringify(req.auth) : undefined,
              body: req.body?.raw || undefined,
            };
            store.endpoints.push(newEp);
            count++;
          }
        }
      };

      const items = collection.item || collection.items || [];
      extractItems(items);
      saveStore(store);
      return { success: true, count };
    } catch (e) {
      return { success: false, count: 0, error: (e as Error).message };
    }
  },

  // --------------- APPLY TO ApiClient ---------------
  /**
   * Applies an environment config to the live ApiClient instance.
   * This makes the selected base URL + prefix active for all future requests.
   */
  applyEnvironment(envId: string): boolean {
    const envs = this.getEnvironments();
    const env = envs.find(e => e.id === envId);
    if (!env) return false;
    const baseUrl = `${env.protocol}${env.baseUrl}`;
    apiClient.baseURL = baseUrl;
    apiClient.apiPrefix = env.apiPrefix ? `/api` : '';
    return true;
  },

  /** Returns current ApiClient base URL + prefix for display */
  getCurrentClientConfig(): { baseURL: string; apiPrefix: string } {
    return {
      baseURL: apiClient.baseURL,
      apiPrefix: apiClient.apiPrefix,
    };
  },

  // --------------- IMPORT VALIDATION / PREVIEW ---------------
  /**
   * Validates an import file and returns a preview of what will be imported,
   * WITHOUT actually importing anything. Used for the import preview dialog.
   */
  validateImport(json: string): {
    valid: boolean;
    format: 'postman' | 'busbudd' | 'unknown';
    error?: string;
    preview: {
      environments: Array<{ name: string; baseUrl: string; environment: string }>;
      endpoints: Array<{ method: string; path: string; description: string }>;
      duplicates: Array<{ path: string; method: string }>;
    };
  } {
    const result: ReturnType<typeof this.validateImport> = {
      valid: false,
      format: 'unknown',
      preview: { environments: [], endpoints: [], duplicates: [] },
    };
    try {
      const parsed = JSON.parse(json);
      const existingEndpoints = this.getEndpoints();

      // Detect Postman format
      if (parsed.info && parsed.item) {
        result.format = 'postman';
        const extractItems = (items: any[]): void => {
          for (const item of items) {
            if (item.item) { extractItems(item.item); continue; }
            if (item.request) {
              const req = item.request;
              const method = (typeof req.method === 'string' ? req.method : 'GET').toUpperCase();
              let path = '';
              if (typeof req.url === 'string') path = req.url;
              else if (req.url?.raw) path = req.url.raw;
              else if (req.url?.path) path = '/' + (Array.isArray(req.url.path) ? req.url.path.join('/') : req.url.path);
              try { path = new URL(path).pathname; } catch { /* relative path */ }
              result.preview.endpoints.push({ method, path, description: item.name || path });
              if (existingEndpoints.some(ep => ep.path === path && ep.method === method)) {
                result.preview.duplicates.push({ path, method });
              }
            }
          }
        };
        extractItems(parsed.item || []);
        result.valid = result.preview.endpoints.length > 0;
        return result;
      }

      // Detect BusBudd internal format
      if (parsed.environments || parsed.endpoints) {
        result.format = 'busbudd';
        if (Array.isArray(parsed.environments)) {
          result.preview.environments = parsed.environments.map((e: any) => ({
            name: e.name || 'Unnamed', baseUrl: e.baseUrl || '', environment: e.environment || 'custom',
          }));
        }
        if (Array.isArray(parsed.endpoints)) {
          result.preview.endpoints = parsed.endpoints.map((ep: any) => ({
            method: ep.method || 'GET', path: ep.path || '', description: ep.description || '',
          }));
          for (const ep of parsed.endpoints) {
            if (existingEndpoints.some(ex => ex.path === ep.path && ex.method === ep.method)) {
              result.preview.duplicates.push({ path: ep.path, method: ep.method });
            }
          }
        }
        result.valid = result.preview.environments.length > 0 || result.preview.endpoints.length > 0;
        return result;
      }

      result.error = 'Unrecognized file format. Expected a Postman collection or BusBudd config.';
      return result;
    } catch (e) {
      result.error = `Invalid JSON: ${(e as Error).message}`;
      return result;
    }
  },

  // --------------- CODE GENERATION ---------------
  /**
   * Generates a TypeScript code snippet representing the current endpoints
   * in the format used by apiEndpoints.ts.
   */
  generateTypeScriptCode(): string {
    const derived = deriveEndpointsFromConfig();
    const groups: Record<string, Array<{ key: string; path: string; isDynamic: boolean }>> = {};

    for (const d of derived) {
      if (!groups[d.group]) groups[d.group] = [];
      groups[d.group].push({ key: d.key, path: d.path, isDynamic: d.isDynamic });
    }

    let code = `export const API = {\n`;
    const groupEntries = Object.entries(groups);
    groupEntries.forEach(([group, entries], gi) => {
      code += `  ${group}: {\n`;
      entries.forEach((entry, ei) => {
        if (entry.isDynamic) {
          code += `    ${entry.key}: (id: string) => \`${entry.path.replace(':id', '${id}')}\``;
        } else {
          code += `    ${entry.key}: '${entry.path}'`;
        }
        code += ei < entries.length - 1 ? ',\n' : '\n';
      });
      code += `  }` + (gi < groupEntries.length - 1 ? ',\n' : '\n');
    });
    code += `} as const;\n`;

    return code;
  },

  // --------------- DIFF PREVIEW ---------------
  /**
   * Generates a simple text diff showing what would change when applying
   * an environment to the API client.
   */
  generateDiffPreview(envId: string): { current: { baseURL: string; apiPrefix: string }; proposed: { baseURL: string; apiPrefix: string } } | null {
    const env = this.getEnvironments().find(e => e.id === envId);
    if (!env) return null;
    return {
      current: { baseURL: apiClient.baseURL, apiPrefix: apiClient.apiPrefix },
      proposed: {
        baseURL: `${env.protocol}${env.baseUrl}`,
        apiPrefix: env.apiPrefix ? '/api' : '',
      },
    };
  },

  // --------------- USAGE WARNINGS ---------------
  /**
   * Detects endpoints that are:
   * 1. Used in apiEndpoints.ts but NOT defined as custom endpoints
   * 2. Defined as custom endpoints but don't match any apiEndpoints.ts constant
   */
  getUsageWarnings(): Array<{ type: 'unused' | 'undefined'; path: string; constant?: string; detail: string }> {
    const derived = deriveEndpointsFromConfig();
    const customEndpoints = this.getEndpoints();
    const warnings: Array<{ type: 'unused' | 'undefined'; path: string; constant?: string; detail: string }> = [];

    // Custom endpoints that don't match any derived constant
    for (const ep of customEndpoints) {
      const match = derived.find(d => d.path === ep.path);
      if (!match) {
        warnings.push({
          type: 'unused',
          path: ep.path,
          detail: `Custom endpoint "${ep.path}" doesn't match any API constant in apiEndpoints.ts.`,
        });
      }
    }

    return warnings;
  },

  deriveEndpoints: deriveEndpointsFromConfig,
  inferMethod,
};

export default endpointConfigService;
