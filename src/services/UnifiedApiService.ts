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

/** Seed localStorage with mock data on first load */
const initializeStorage = (): void => {
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
    const items = storage.get<T[]>(entityKey, fallback);
    return { [pluralKey]: items };
  },

  async getById(id: string) {
    const items = storage.get<T[]>(entityKey, fallback);
    const item = items.find(i => i.id === id);
    return { [singularKey]: item };
  },

  async create(data: Partial<T>) {
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
    const items = storage.get<T[]>(entityKey, fallback);
    const updated = items.map(i =>
      i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
    );
    storage.set(entityKey, updated);
    apiClient.clearCache(endpoints.BASE);
    return { [singularKey]: updated.find(i => i.id === id) };
  },

  async delete(id: string) {
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
    return { otp: Math.floor(100000 + Math.random() * 900000).toString(), expiresIn: 300 };
  },

  async getQrCode(id: string): Promise<QrCodeResult> {
    return { qrData: `busbudd://driver/${id}`, url: `https://app.busbudd.com/driver/${id}` };
  },

  async updateStatus(id: string, status: string): Promise<{ driver: Driver | undefined }> {
    const drivers = storage.get<Driver[]>('drivers', MOCK_DRIVERS as Driver[]);
    const updated = drivers.map(d => d.id === id ? { ...d, status } : d);
    storage.set('drivers', updated);
    apiClient.clearCache(API.DRIVERS.BASE);
    return { driver: updated.find(d => d.id === id) as Driver | undefined };
  },

  async getLive(): Promise<{ drivers: Driver[] }> {
    const drivers = storage.get<Driver[]>('drivers', MOCK_DRIVERS as Driver[]);
    return { drivers: drivers.filter(d => d.status !== 'OFF_DUTY') };
  },
};

export const routeService = {
  ...createCrudService<TransportRoute & EntityWithId>('routes', 'route', 'routes', 'R', MOCK_ROUTES as (TransportRoute & EntityWithId)[], API.ROUTES),

  async getTrips(routeId: string): Promise<{ trips: Trip[] }> {
    const trips = storage.get<Trip[]>('trips', MOCK_TRIPS as Trip[]);
    return { trips: trips.filter(t => t.routeId === routeId) };
  },

  async exportRoutes(format: string = 'csv'): Promise<{ data: TransportRoute[]; format: string }> {
    const routes = storage.get<TransportRoute[]>('routes', MOCK_ROUTES as TransportRoute[]);
    return { data: routes, format };
  },

  async getLive(): Promise<{ routes: TransportRoute[] }> {
    const routes = storage.get<TransportRoute[]>('routes', MOCK_ROUTES as TransportRoute[]);
    return { routes: routes.filter(r => r.status === 'ACTIVE') };
  },
};

export const tripService = {
  ...createCrudService<Trip & EntityWithId>('trips', 'trip', 'trips', 'T', MOCK_TRIPS as (Trip & EntityWithId)[], API.TRIPS),

  async flagIncident(id: string, reason: string): Promise<{ success: boolean; flagId: string }> {
    return { success: true, flagId: `FLAG_${Date.now()}` };
  },

  async getPlayback(id: string): Promise<{ waypoints: unknown[]; duration: number }> {
    return { waypoints: [], duration: 0 };
  },

  async getEvents(id: string): Promise<{ events: TripEvent[] }> {
    const trips = storage.get<Trip[]>('trips', MOCK_TRIPS as Trip[]);
    const trip = trips.find(t => t.id === id);
    return { events: trip?.events || [] };
  },

  async getStats(period: string = 'monthly'): Promise<{ stats: TripStats }> {
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
    apiClient.clearCache(API.STUDENTS.BASE);
    return { added: 15, updated: 0, failed: 0 };
  },
};

export const assignmentService = {
  ...createCrudService<Assignment & EntityWithId>('assignments', 'assignment', 'assignments', 'A', [] as (Assignment & EntityWithId)[], API.ASSIGNMENTS),

  async getConflicts(): Promise<{ conflicts: unknown[] }> {
    return { conflicts: [] };
  },
};

export const shiftService = {
  ...createCrudService<Shift & EntityWithId>('shifts', 'shift', 'shifts', 'SH', [] as (Shift & EntityWithId)[], API.SHIFTS),

  async duplicate(id: string): Promise<{ shift?: Shift; success?: boolean; error?: string }> {
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
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    return { notifications };
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    storage.set('notifications', updated);
    return { success: true };
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    storage.set('notifications', notifications.map(n => ({ ...n, read: true })));
    return { success: true };
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const notifications = storage.get<Notification[]>('notifications', MOCK_NOTIFICATIONS_DATA as Notification[]);
    storage.set('notifications', notifications.filter(n => n.id !== id));
    return { success: true };
  },

  async getUnreadCount(): Promise<{ count: number }> {
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
        loginHeroImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop',
        heroMode: 'url',
        uploadedHeroImage: null,
        logoMode: 'url',
        logoUrls: { light: '', dark: '', platform: '' },
        uploadedLogos: { light: null, dark: null, platform: null },
        testimonials: [
          {
            id: '1',
            name: 'Riaot Escanor',
            role: 'Project Manager at Google',
            text: 'I Landed Multiple Projects Within A Couple Of Days - With This Tool. Definitely My Go To Freelance Platform Now!',
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
    const routes = storage.get<TransportRoute[]>('routes', MOCK_ROUTES as TransportRoute[]);
    const drivers = storage.get<Driver[]>('drivers', MOCK_DRIVERS as Driver[]);
    return {
      fleet: routes.filter(r => r.status === 'ACTIVE'),
      drivers: drivers.filter(d => d.status !== 'OFF_DUTY'),
    };
  },
};
