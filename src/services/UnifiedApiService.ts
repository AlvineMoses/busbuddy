/**
 * UnifiedApiService - Entity-Specific API Services
 *
 * SMART DATA-FLOW Principles:
 * ─────────────────────────────
 * 1. CENTRALIZED ENDPOINTS — All paths imported from apiEndpoints.ts.
 * 2. ENTITY-CENTRIC — One service object per domain entity with consistent CRUD interface.
 * 3. CONSISTENT RESPONSE SHAPE — Every method returns { entity } or { entities }.
 * 4. CACHE INVALIDATION — Mutations clear relevant cache in ApiClient.
 * 5. MOCK → REAL SWAP — Mock implementations with commented-out real API calls.
 * 6. STORAGE PERSISTENCE — localStorage used as mock "database".
 */

import { apiClient, CACHE_TTL } from './ApiClient';
import { API } from '../config/apiEndpoints';
import {
  SCHOOLS as MOCK_SCHOOLS_DATA,
  MOCK_ROUTES,
  MOCK_TRIPS,
  NOTIFICATIONS as MOCK_NOTIFICATIONS_DATA,
  MOCK_DRIVERS,
  MOCK_STUDENTS,
} from '../../services/mockData';
import type {
  School,
  TransportRoute,
  Trip,
  TripEvent,
  Notification,
  Driver,
  Student,
  Assignment,
  Shift,
  DashboardMetrics,
} from '../../types';

// ============================================
// TYPES
// ============================================

interface CrudEndpoints {
  BASE: string;
  BY_ID: (id: string) => string;
}

interface CrudService<T> {
  getAll: (filters?: Record<string, unknown>) => Promise<Record<string, T[]>>;
  getById: (id: string) => Promise<Record<string, T | undefined>>;
  create: (data: Partial<T>) => Promise<Record<string, T>>;
  update: (id: string, updates: Partial<T>) => Promise<Record<string, T | undefined>>;
  delete: (id: string) => Promise<{ success: boolean }>;
}

export interface SchoolStats {
  totalStudents: number;
  totalRoutes: number;
  activeTrips: number;
  onTimeRate: number;
}

export interface OtpResult {
  otp: string;
  expiresIn: number;
}

export interface QrCodeResult {
  qrData: string;
  url: string;
}

export interface TripStats {
  totalTrips: number;
  totalKm: number;
  onTimeRate: number;
  avgDuration: number;
  period: string;
}

export interface DashboardMetricsResult {
  monthTrips: number;
  monthKm: number;
  activeTrips: number;
  contracts: number;
  schools: number;
  students: number;
  onTimeRate: number;
}

export interface SettingsData {
  platformName: string;
  colors: Record<string, string>;
  loginHeroImage: string;
  heroMode: string;
  uploadedHeroImage: string | null;
  logoMode: string;
  logoUrls: { light: string; dark: string; platform: string };
  uploadedLogos: { light: string | null; dark: string | null; platform: string | null };
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    text: string;
    avatar: string;
  }>;
  permissionGroups: unknown[];
}

// ============================================
// DEMO MODE HELPER
// ============================================

/**
 * Returns true when Demo Mode is active.
 * Reads from persisted settings in localStorage.
 * In demo mode: use localStorage mock data.
 * In production mode: hit real API endpoints.
 */
const isDemoMode = (): boolean => {
  try {
    const raw = localStorage.getItem('busbuddy_settings');
    if (raw) {
      const settings = JSON.parse(raw);
      // If featureFlags exist and demoMode is explicitly false, we're in production
      if (settings.featureFlags && typeof settings.featureFlags.demoMode === 'boolean') {
        return settings.featureFlags.demoMode;
      }
    }
  } catch {
    // Fall through to default
  }
  // Default: demo mode ON (safe default for development)
  return true;
};

// ============================================
// PERSISTENCE LAYER — localStorage helpers
// ============================================

const STORAGE_PREFIX = 'busbuddy_';

const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch (e) {
      console.error(`storage.get('${key}') failed:`, e);
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error(`storage.set('${key}') failed:`, e);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },
};

/** Seed localStorage with mock data on first load (demo mode only) */
const initializeStorage = (): void => {
  if (!isDemoMode()) return;
  if (!storage.get('schools', null))        storage.set('schools', MOCK_SCHOOLS_DATA);
  if (!storage.get('drivers', null))        storage.set('drivers', MOCK_DRIVERS);
  if (!storage.get('routes', null))         storage.set('routes', MOCK_ROUTES);
  if (!storage.get('trips', null))          storage.set('trips', MOCK_TRIPS);
  if (!storage.get('students', null))       storage.set('students', MOCK_STUDENTS);
  if (!storage.get('notifications', null))  storage.set('notifications', MOCK_NOTIFICATIONS_DATA);
};

initializeStorage();

// ============================================
// HELPER: Generic CRUD factory
// ============================================

interface EntityWithId {
  id: string;
  [key: string]: unknown;
}

const createCrudService = <T extends EntityWithId>(
  entityKey: string,
  singularKey: string,
  pluralKey: string,
  idPrefix: string,
  fallback: T[],
  endpoints: CrudEndpoints,
): CrudService<T> => ({
  async getAll(filters: Record<string, unknown> = {}) {
    if (!isDemoMode()) {
      const data = await apiClient.get<Record<string, T[]>>(endpoints.BASE, { params: filters, cache: true, cacheMaxAge: CACHE_TTL.MEDIUM });
      return data as Record<string, T[]>;
    }
    const items = storage.get<T[]>(entityKey, fallback);
    return { [pluralKey]: items };
  },

  async getById(id: string) {
    if (!isDemoMode()) {
      const data = await apiClient.get<Record<string, T | undefined>>(endpoints.BY_ID(id), { cache: true });
      return data as Record<string, T | undefined>;
    }
    const items = storage.get<T[]>(entityKey, fallback);
    const item = items.find(i => i.id === id);
    return { [singularKey]: item };
  },

  async create(data: Partial<T>) {
    if (!isDemoMode()) {
      const result = await apiClient.post<Record<string, T>>(endpoints.BASE, data as Record<string, unknown>);
      apiClient.clearCache(endpoints.BASE);
      return result as Record<string, T>;
    }
    const items = storage.get<T[]>(entityKey, fallback);
    const newItem = {
      id: `${idPrefix}${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    } as unknown as T;
    storage.set(entityKey, [...items, newItem]);
    apiClient.clearCache(endpoints.BASE);
    return { [singularKey]: newItem };
  },

  async update(id: string, updates: Partial<T>) {
    if (!isDemoMode()) {
      const result = await apiClient.put<Record<string, T | undefined>>(endpoints.BY_ID(id), updates as Record<string, unknown>);
      apiClient.clearCache(endpoints.BASE);
      return result as Record<string, T | undefined>;
    }
    const items = storage.get<T[]>(entityKey, fallback);
    const updated = items.map(i =>
      i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
    );
    storage.set(entityKey, updated);
    apiClient.clearCache(endpoints.BASE);
    return { [singularKey]: updated.find(i => i.id === id) };
  },

  async delete(id: string) {
    if (!isDemoMode()) {
      await apiClient.delete(endpoints.BY_ID(id));
      apiClient.clearCache(endpoints.BASE);
      return { success: true };
    }
    const items = storage.get<T[]>(entityKey, fallback);
    storage.set(entityKey, items.filter(i => i.id !== id));
    apiClient.clearCache(endpoints.BASE);
    return { success: true };
  },
});

// ============================================
// ENTITY SERVICES
// ============================================

export const schoolService = {
  ...createCrudService<School & EntityWithId>('schools', 'school', 'schools', 'S', MOCK_SCHOOLS_DATA as (School & EntityWithId)[], API.SCHOOLS),

  async getStats(id: string): Promise<{ stats: SchoolStats }> {
    if (!isDemoMode()) {
      return apiClient.get<{ stats: SchoolStats }>(API.SCHOOLS.STATS(id), { cache: true });
    }
    return {
      stats: {
        totalStudents: 248,
        totalRoutes: 6,
        activeTrips: 2,
        onTimeRate: 94.5,
      },
    };
  },
};

export const driverService = {
  ...createCrudService<Driver & EntityWithId>('drivers', 'driver', 'drivers', 'D', MOCK_DRIVERS as (Driver & EntityWithId)[], API.DRIVERS),

  async generateOtp(id: string): Promise<OtpResult> {
    if (!isDemoMode()) {
      return apiClient.post<OtpResult>(API.DRIVERS.GENERATE_OTP(id));
    }
    return { otp: Math.floor(100000 + Math.random() * 900000).toString(), expiresIn: 300 };
  },

  async getQrCode(id: string): Promise<QrCodeResult> {
    if (!isDemoMode()) {
      return apiClient.get<QrCodeResult>(API.DRIVERS.QR_CODE(id), { cache: true });
    }
    return { qrData: `busbudd://driver/${id}`, url: `https://app.busbudd.com/driver/${id}` };
  },

  async updateStatus(id: string, status: string): Promise<{ driver: Driver | undefined }> {
    if (!isDemoMode()) {
      const result = await apiClient.put<{ driver: Driver }>(API.DRIVERS.STATUS(id), { status });
      apiClient.clearCache(API.DRIVERS.BASE);
      return result;
    }
    const drivers = storage.get<Driver[]>('drivers', MOCK_DRIVERS as Driver[]);
    const updated = drivers.map(d => d.id === id ? { ...d, status } : d);
    storage.set('drivers', updated);
    apiClient.clearCache(API.DRIVERS.BASE);
    return { driver: updated.find(d => d.id === id) as Driver | undefined };
  },

  async getLive(): Promise<{ drivers: Driver[] }> {
    if (!isDemoMode()) {
      return apiClient.get<{ drivers: Driver[] }>(API.DRIVERS.LIVE, { cache: true, cacheMaxAge: CACHE_TTL.SHORT });
    }
    const drivers = storage.get<Driver[]>('drivers', MOCK_DRIVERS as Driver[]);
    return { drivers: drivers.filter(d => d.status !== 'OFF_DUTY') };
  },
};

export const routeService = {
  ...createCrudService<TransportRoute & EntityWithId>('routes', 'route', 'routes', 'R', MOCK_ROUTES as (TransportRoute & EntityWithId)[], API.ROUTES),

  async getTrips(routeId: string): Promise<{ trips: Trip[] }> {
    if (!isDemoMode()) {
      return apiClient.get<{ trips: Trip[] }>(API.ROUTES.TRIPS(routeId), { cache: true, cacheMaxAge: CACHE_TTL.SHORT });
    }
    const trips = storage.get<Trip[]>('trips', MOCK_TRIPS as Trip[]);
    return { trips: trips.filter(t => t.routeId === routeId) };
  },

  async exportRoutes(format: string = 'csv'): Promise<{ data: TransportRoute[]; format: string }> {
    if (!isDemoMode()) {
      return apiClient.get<{ data: TransportRoute[]; format: string }>(API.ROUTES.EXPORT, { params: { format } });
    }
    const routes = storage.get<TransportRoute[]>('routes', MOCK_ROUTES as TransportRoute[]);
    return { data: routes, format };
  },

  async getLive(): Promise<{ routes: TransportRoute[] }> {
    if (!isDemoMode()) {
      return apiClient.get<{ routes: TransportRoute[] }>(API.ROUTES.LIVE, { cache: true, cacheMaxAge: CACHE_TTL.SHORT });
    }
    const routes = storage.get<TransportRoute[]>('routes', MOCK_ROUTES as TransportRoute[]);
    return { routes: routes.filter(r => r.status === 'ACTIVE') };
  },
};

export const tripService = {
  ...createCrudService<Trip & EntityWithId>('trips', 'trip', 'trips', 'T', MOCK_TRIPS as (Trip & EntityWithId)[], API.TRIPS),

  async flagIncident(id: string, reason: string): Promise<{ success: boolean; flagId: string }> {
    if (!isDemoMode()) {
      return apiClient.post<{ success: boolean; flagId: string }>(API.TRIPS.FLAG(id), { reason });
    }
    return { success: true, flagId: `FLAG_${Date.now()}` };
  },

  async getPlayback(id: string): Promise<{ waypoints: unknown[]; duration: number }> {
    if (!isDemoMode()) {
      return apiClient.get<{ waypoints: unknown[]; duration: number }>(API.TRIPS.PLAYBACK(id), { cache: true });
    }
    return { waypoints: [], duration: 0 };
  },

  async getEvents(id: string): Promise<{ events: TripEvent[] }> {
    if (!isDemoMode()) {
      return apiClient.get<{ events: TripEvent[] }>(API.TRIPS.EVENTS(id), { cache: true, cacheMaxAge: CACHE_TTL.SHORT });
    }
    const trips = storage.get<Trip[]>('trips', MOCK_TRIPS as Trip[]);
    const trip = trips.find(t => t.id === id);
    return { events: trip?.events || [] };
  },

  async getStats(period: string = 'monthly'): Promise<{ stats: TripStats }> {
    if (!isDemoMode()) {
      return apiClient.get<{ stats: TripStats }>(API.TRIPS.STATS, { params: { period }, cache: true, cacheMaxAge: CACHE_TTL.MEDIUM });
    }
    return {
      stats: {
        totalTrips: 1240,
        totalKm: 4500,
        onTimeRate: 94.5,
        avgDuration: 42,
        period,
      },
    };
  },
};

export const studentService = {
  ...createCrudService<Student & EntityWithId>('students', 'student', 'students', 'ST', MOCK_STUDENTS as (Student & EntityWithId)[], API.STUDENTS),

  async toggleDisable(id: string): Promise<{ student: Student | undefined }> {
    if (!isDemoMode()) {
      const result = await apiClient.post<{ student: Student }>(API.STUDENTS.DISABLE(id));
      apiClient.clearCache(API.STUDENTS.BASE);
      return result;
    }
    const students = storage.get<Student[]>('students', MOCK_STUDENTS as Student[]);
    const student = students.find(s => s.id === id);
    const newStatus = student?.status === 'DISABLED' ? 'WAITING' : 'DISABLED';
    const updated = students.map(s =>
      s.id === id ? { ...s, status: newStatus } : s
    );
    storage.set('students', updated);
    apiClient.clearCache(API.STUDENTS.BASE);
    return { student: updated.find(s => s.id === id) as Student | undefined };
  },

  async transfer(id: string, targetSchoolId: string): Promise<{ student: Student | undefined }> {
    if (!isDemoMode()) {
      const result = await apiClient.post<{ student: Student }>(API.STUDENTS.TRANSFER(id), { targetSchoolId });
      apiClient.clearCache(API.STUDENTS.BASE);
      return result;
    }
    const students = storage.get<Student[]>('students', MOCK_STUDENTS as Student[]);
    const schools = storage.get<School[]>('schools', MOCK_SCHOOLS_DATA as School[]);
    const targetSchool = schools.find(s => s.id === targetSchoolId);
    const updated = students.map(s =>
      s.id === id ? { ...s, school: targetSchool?.name || 'Unknown' } : s
    );
    storage.set('students', updated);
    apiClient.clearCache(API.STUDENTS.BASE);
    return { student: updated.find(s => s.id === id) as Student | undefined };
  },

  async bulkUpload(file: File): Promise<{ added: number; updated: number; failed: number }> {
    if (!isDemoMode()) {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.post<{ added: number; updated: number; failed: number }>(API.STUDENTS.BULK_UPLOAD, formData as unknown as Record<string, unknown>);
      apiClient.clearCache(API.STUDENTS.BASE);
      return result;
    }
    apiClient.clearCache(API.STUDENTS.BASE);
    return { added: 15, updated: 0, failed: 0 };
  },
};

export const assignmentService = {
  ...createCrudService<Assignment & EntityWithId>('assignments', 'assignment', 'assignments', 'A', [] as (Assignment & EntityWithId)[], API.ASSIGNMENTS),

  async getConflicts(): Promise<{ conflicts: unknown[] }> {
    if (!isDemoMode()) {
      return apiClient.get<{ conflicts: unknown[] }>(API.ASSIGNMENTS.CONFLICTS, { cache: true });
    }
    return { conflicts: [] };
  },
};

export const shiftService = {
  ...createCrudService<Shift & EntityWithId>('shifts', 'shift', 'shifts', 'SH', [] as (Shift & EntityWithId)[], API.SHIFTS),

  async duplicate(id: string): Promise<{ shift?: Shift; success?: boolean; error?: string }> {
    if (!isDemoMode()) {
      const result = await apiClient.post<{ shift: Shift }>(API.SHIFTS.DUPLICATE(id));
      apiClient.clearCache(API.SHIFTS.BASE);
      return result;
    }
    const shifts = storage.get<Shift[]>('shifts', []);
    const source = shifts.find(s => s.id === id);
    if (!source) return { success: false, error: 'Shift not found' };

    const copy: Shift = {
      ...source,
      id: `SH${Date.now()}`,
      shiftName: `${source.shiftName} (Copy)`,
    };
    storage.set('shifts', [...shifts, copy]);
    apiClient.clearCache(API.SHIFTS.BASE);
    return { shift: copy };
  },
};

export const notificationService = {
  async getAll(): Promise<{ notifications: Notification[] }> {
    if (!isDemoMode()) {
      return apiClient.get<{ notifications: Notification[] }>(API.NOTIFICATIONS.BASE, { cache: true, cacheMaxAge: CACHE_TTL.SHORT });
    }
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    return { notifications };
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    if (!isDemoMode()) {
      const result = await apiClient.put<{ success: boolean }>(API.NOTIFICATIONS.READ(id));
      apiClient.clearCache(API.NOTIFICATIONS.BASE);
      return result;
    }
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    storage.set('notifications', updated);
    return { success: true };
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    if (!isDemoMode()) {
      const result = await apiClient.put<{ success: boolean }>(API.NOTIFICATIONS.READ_ALL);
      apiClient.clearCache(API.NOTIFICATIONS.BASE);
      return result;
    }
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    storage.set('notifications', notifications.map(n => ({ ...n, read: true })));
    return { success: true };
  },

  async delete(id: string): Promise<{ success: boolean }> {
    if (!isDemoMode()) {
      const result = await apiClient.delete<{ success: boolean }>(API.NOTIFICATIONS.BY_ID(id));
      apiClient.clearCache(API.NOTIFICATIONS.BASE);
      return result;
    }
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    storage.set('notifications', notifications.filter(n => n.id !== id));
    return { success: true };
  },

  async getUnreadCount(): Promise<{ count: number }> {
    if (!isDemoMode()) {
      return apiClient.get<{ count: number }>(API.NOTIFICATIONS.UNREAD_COUNT, { cache: true, cacheMaxAge: CACHE_TTL.SHORT });
    }
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    return { count: notifications.filter(n => !n.read).length };
  },
};

export const settingsService = {
  async get(): Promise<{ settings: SettingsData }> {
    const saved = localStorage.getItem('busbuddy_settings');
    if (saved) {
      try {
        return { settings: JSON.parse(saved) as SettingsData };
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }

    return {
      settings: {
        platformName: 'Bus Buddy',
        colors: {
          primary: '#ff3600',
          secondary: '#1fd701',
          surface: '#f8fafc',
          statusActive: '#1fd701',
          statusScheduled: '#bda8ff',
          statusWarning: '#ff9d00',
          statusCompleted: '#FF6106',
        },
        loginHeroImage: '/uploads/busbuddy.jpg',
        heroMode: 'url',
        uploadedHeroImage: null,
        logoMode: 'url',
        logoUrls: { light: '', dark: '/uploads/logo-dark.svg', platform: '/uploads/logo-dark.svg' },
        uploadedLogos: { light: null, dark: null, platform: null },
        testimonials: [
          {
            id: '1',
            name: 'Samuel Okoye',
            role: 'Bus Driver at Little School',
            text: 'The students anf parents both love it! Boarding and dropping off students has never been easier.',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop',
          },
        ],
        permissionGroups: [],
      },
    };
  },

  async update(updates: Partial<SettingsData>): Promise<{ settings: Partial<SettingsData> }> {
    localStorage.setItem('busbuddy_settings', JSON.stringify(updates));
    apiClient.clearCache(API.SETTINGS.BASE);
    return { settings: updates };
  },

  async uploadImage(formData: FormData): Promise<{ url: string; fileName: string; type: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const type = formData.get('type') as string;
        const file = formData.get('file') as File;
        resolve({
          url: `https://example.com/uploads/${file.name}`,
          fileName: file.name,
          type,
        });
      }, 1000);
    });
  },

  async updatePermissions(permissions: unknown): Promise<{ success: boolean }> {
    return { success: true };
  },
};

export const dashboardService = {
  async getMetrics(): Promise<{ metrics: DashboardMetricsResult }> {
    if (!isDemoMode()) {
      return apiClient.get<{ metrics: DashboardMetricsResult }>(API.DASHBOARD.METRICS, { cache: true, cacheMaxAge: CACHE_TTL.SHORT });
    }
    const routes = storage.get<TransportRoute[]>('routes', MOCK_ROUTES as TransportRoute[]);
    return {
      metrics: {
        monthTrips: 1240,
        monthKm: 4500,
        activeTrips: routes.filter(r => r.status === 'ACTIVE').length,
        contracts: 12,
        schools: storage.get<School[]>('schools', MOCK_SCHOOLS_DATA as School[]).length,
        students: storage.get<Student[]>('students', MOCK_STUDENTS as Student[]).length,
        onTimeRate: 94.5,
      },
    };
  },

  async getLiveFeed(): Promise<{ fleet: TransportRoute[]; drivers: Driver[] }> {
    if (!isDemoMode()) {
      return apiClient.get<{ fleet: TransportRoute[]; drivers: Driver[] }>(API.DASHBOARD.LIVE_FEED, { cache: true, cacheMaxAge: CACHE_TTL.SHORT });
    }
    const routes = storage.get<TransportRoute[]>('routes', MOCK_ROUTES as TransportRoute[]);
    const drivers = storage.get<Driver[]>('drivers', MOCK_DRIVERS as Driver[]);
    return {
      fleet: routes.filter(r => r.status === 'ACTIVE'),
      drivers: drivers.filter(d => d.status !== 'OFF_DUTY'),
    };
  },
};
