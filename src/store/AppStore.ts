/**
 * AppStore - Global State Management with Zustand
 *
 * SMART DATA-FLOW Principles:
 * ─────────────────────────────
 * 1. SINGLE SOURCE OF TRUTH — All entity data lives here.
 * 2. IMMUTABLE UPDATES — Zustand's `set` produces new state references safely.
 * 3. DERIVED STATE — Computed via selectors in hooks (useAppData), not stored.
 * 4. CENTRALIZED META — Loading, error, and lastFetch timestamps per entity.
 * 5. CACHE-AWARE FETCHING — Each fetch checks staleness before hitting the API.
 * 6. AUTH DELEGATION — Auth state managed by AuthService singleton, mirrored here.
 * 7. ENTITY-AGNOSTIC HELPERS — Generic _fetchEntity / _mutateEntity reduce boilerplate.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService } from '../services/AuthService';
import type { LoginCredentials } from '../services/AuthService';
import type {
  User,
  School,
  TransportRoute,
  Trip,
  Driver,
  Student,
  Assignment,
  Shift,
  Notification,
} from '../../types';
import type { SettingsData, DashboardMetricsResult } from '../services/UnifiedApiService';
import {
  schoolService,
  driverService,
  routeService,
  tripService,
  studentService,
  assignmentService,
  shiftService,
  notificationService,
  settingsService,
  dashboardService,
} from '../services/UnifiedApiService';

// ============================================
// TYPES
// ============================================

interface EntityMeta {
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface EntitiesState {
  schools: School[];
  drivers: Driver[];
  routes: TransportRoute[];
  trips: Trip[];
  students: Student[];
  assignments: Assignment[];
  shifts: Shift[];
  notifications: Notification[];
  settings: SettingsData | null;
  dashboardMetrics: DashboardMetricsResult | null;
}

interface MetaState {
  schools: EntityMeta;
  drivers: EntityMeta;
  routes: EntityMeta;
  trips: EntityMeta;
  students: EntityMeta;
  assignments: EntityMeta;
  shifts: EntityMeta;
  notifications: EntityMeta;
  settings: EntityMeta;
  dashboard: EntityMeta;
}

interface UIState {
  activePage: string;
  selectedSchoolId: string;
  sidebarCollapsed: boolean;
}

interface MutationResult {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface AppState {
  auth: AuthState;
  entities: EntitiesState;
  meta: MetaState;
  ui: UIState;

  // Generic helpers
  _fetchEntity: (
    entityKey: keyof MetaState,
    apiFn: () => Promise<Record<string, unknown>>,
    pluralKey: string,
    ttl?: number,
    force?: boolean,
  ) => Promise<void>;
  _mutateEntity: (
    entityKey: keyof MetaState,
    mutationFn: () => Promise<Record<string, unknown>>,
    onSuccess?: (result: Record<string, unknown>, set: SetFn, get: GetFn) => void,
  ) => Promise<MutationResult>;

  // Auth
  login: (credentials: LoginCredentials) => Promise<MutationResult>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;

  // Schools
  fetchSchools: (force?: boolean) => Promise<void>;
  createSchool: (data: Partial<School>) => Promise<MutationResult>;
  updateSchool: (id: string, updates: Partial<School>) => Promise<MutationResult>;
  deleteSchool: (id: string) => Promise<MutationResult>;

  // Drivers
  fetchDrivers: (force?: boolean) => Promise<void>;
  createDriver: (data: Partial<Driver>) => Promise<MutationResult>;
  updateDriver: (id: string, updates: Partial<Driver>) => Promise<MutationResult>;
  deleteDriver: (id: string) => Promise<MutationResult>;
  generateDriverOtp: (id: string) => Promise<{ otp: string; expiresIn: number }>;
  getDriverQrCode: (id: string) => Promise<{ qrData: string; url: string }>;

  // Routes
  fetchRoutes: (force?: boolean) => Promise<void>;
  createRoute: (data: Partial<TransportRoute>) => Promise<MutationResult>;
  updateRoute: (id: string, updates: Partial<TransportRoute>) => Promise<MutationResult>;
  deleteRoute: (id: string) => Promise<MutationResult>;
  exportRoutes: (format?: string) => Promise<{ data: TransportRoute[]; format: string }>;

  // Trips
  fetchTrips: (force?: boolean) => Promise<void>;
  flagTripIncident: (id: string, reason: string) => Promise<{ success: boolean; flagId: string }>;
  getTripPlayback: (id: string) => Promise<{ waypoints: unknown[]; duration: number }>;
  getTripStats: (period?: string) => Promise<unknown>;

  // Students
  fetchStudents: (force?: boolean) => Promise<void>;
  createStudent: (data: Partial<Student>) => Promise<MutationResult>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<MutationResult>;
  deleteStudent: (id: string) => Promise<MutationResult>;
  toggleStudentDisable: (id: string) => Promise<unknown>;
  transferStudent: (id: string, targetSchoolId: string) => Promise<unknown>;
  bulkUploadStudents: (file: File) => Promise<unknown>;

  // Assignments
  fetchAssignments: (force?: boolean) => Promise<void>;
  createAssignment: (data: Partial<Assignment>) => Promise<MutationResult>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<MutationResult>;
  deleteAssignment: (id: string) => Promise<MutationResult>;
  getAssignmentConflicts: () => Promise<{ conflicts: unknown[] }>;

  // Shifts
  fetchShifts: (force?: boolean) => Promise<void>;
  createShift: (data: Partial<Shift>) => Promise<MutationResult>;
  updateShift: (id: string, updates: Partial<Shift>) => Promise<MutationResult>;
  deleteShift: (id: string) => Promise<MutationResult>;
  duplicateShift: (id: string) => Promise<MutationResult>;

  // Notifications
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Settings
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<SettingsData>) => Promise<MutationResult>;

  // Dashboard
  fetchDashboardMetrics: (force?: boolean) => Promise<void>;

  // UI
  setActivePage: (page: string) => void;
  setSelectedSchool: (schoolId: string) => void;
  toggleSidebar: () => void;

  // Bulk
  refreshAll: (force?: boolean) => Promise<void>;
}

type SetFn = (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void;
type GetFn = () => AppState;

// ============================================
// CACHE TTL CONSTANTS (milliseconds)
// ============================================
const CACHE_TTL = {
  SHORT:  60_000,
  MEDIUM: 300_000,
  LONG:   900_000,
};

// ============================================
// INITIAL META STATE
// ============================================
const createEntityMeta = (): EntityMeta => ({
  loading: false,
  error: null,
  lastFetch: null,
});

// ============================================
// STORE DEFINITION
// ============================================

const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({

      // ──────────────────────────────────────
      // AUTH STATE
      // ──────────────────────────────────────
      auth: {
        user: authService.user,
        token: authService.token,
        isAuthenticated: authService.isAuthenticated,
        isLoading: false,
        error: null,
      },

      // ──────────────────────────────────────
      // ENTITY DATA
      // ──────────────────────────────────────
      entities: {
        schools: [],
        drivers: [],
        routes: [],
        trips: [],
        students: [],
        assignments: [],
        shifts: [],
        notifications: [],
        settings: null,
        dashboardMetrics: null,
      },

      // ──────────────────────────────────────
      // META STATE
      // ──────────────────────────────────────
      meta: {
        schools:       createEntityMeta(),
        drivers:       createEntityMeta(),
        routes:        createEntityMeta(),
        trips:         createEntityMeta(),
        students:      createEntityMeta(),
        assignments:   createEntityMeta(),
        shifts:        createEntityMeta(),
        notifications: createEntityMeta(),
        settings:      createEntityMeta(),
        dashboard:     createEntityMeta(),
      },

      // ──────────────────────────────────────
      // UI STATE
      // ──────────────────────────────────────
      ui: {
        activePage: 'dashboard',
        selectedSchoolId: '',
        sidebarCollapsed: true,
      },

      // ============================================
      // GENERIC HELPERS
      // ============================================

      _fetchEntity: async (entityKey, apiFn, pluralKey, ttl = CACHE_TTL.MEDIUM, force = false) => {
        const { meta } = get();
        const entityMeta = meta[entityKey];

        if (!force && entityMeta.lastFetch && (Date.now() - entityMeta.lastFetch < ttl)) {
          return;
        }

        set((state) => ({
          meta: {
            ...state.meta,
            [entityKey]: { ...state.meta[entityKey], loading: true, error: null },
          },
        }));

        try {
          const result = await apiFn();
          set((state) => ({
            entities: { ...state.entities, [entityKey]: result[pluralKey] },
            meta: {
              ...state.meta,
              [entityKey]: { loading: false, error: null, lastFetch: Date.now() },
            },
          }));
        } catch (error) {
          set((state) => ({
            meta: {
              ...state.meta,
              [entityKey]: { ...state.meta[entityKey], loading: false, error: (error as Error).message },
            },
          }));
        }
      },

      _mutateEntity: async (entityKey, mutationFn, onSuccess) => {
        try {
          const result = await mutationFn();
          if (onSuccess) onSuccess(result, set, get);
          return { success: true, ...result };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      },

      // ============================================
      // AUTH ACTIONS
      // ============================================

      login: async (credentials) => {
        set((state) => ({
          auth: { ...state.auth, isLoading: true, error: null },
        }));

        try {
          const { user, token } = await authService.login(credentials);
          set({
            auth: { user, token, isAuthenticated: true, isLoading: false, error: null },
          });
          return { success: true };
        } catch (error) {
          set((state) => ({
            auth: { ...state.auth, isLoading: false, error: (error as Error).message },
          }));
          return { success: false, error: (error as Error).message };
        }
      },

      setUser: (user) => {
        if (user) {
          authService.loginDirect(user);
        }
        set((state) => ({
          auth: { ...state.auth, user, isAuthenticated: !!user },
        }));
      },

      logout: async () => {
        await authService.logout();
        set({
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
          ui: { activePage: 'dashboard', selectedSchoolId: '', sidebarCollapsed: true },
        });
      },

      // ============================================
      // SCHOOL ACTIONS
      // ============================================

      fetchSchools: (force = false) =>
        get()._fetchEntity('schools', () => schoolService.getAll(), 'schools', CACHE_TTL.MEDIUM, force),

      createSchool: (data) =>
        get()._mutateEntity('schools', () => schoolService.create(data), (result, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, schools: [...state.entities.schools, result.school as School] },
          }));
        }),

      updateSchool: (id, updates) =>
        get()._mutateEntity('schools', () => schoolService.update(id, updates), (result, set) => {
          set((state: AppState) => ({
            entities: {
              ...state.entities,
              schools: state.entities.schools.map(s => s.id === id ? result.school as School : s),
            },
          }));
        }),

      deleteSchool: (id) =>
        get()._mutateEntity('schools', () => schoolService.delete(id), (_, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, schools: state.entities.schools.filter(s => s.id !== id) },
          }));
        }),

      // ============================================
      // DRIVER ACTIONS
      // ============================================

      fetchDrivers: (force = false) =>
        get()._fetchEntity('drivers', () => driverService.getAll(), 'drivers', CACHE_TTL.MEDIUM, force),

      createDriver: (data) =>
        get()._mutateEntity('drivers', () => driverService.create(data), (result, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, drivers: [...state.entities.drivers, result.driver as Driver] },
          }));
        }),

      updateDriver: (id, updates) =>
        get()._mutateEntity('drivers', () => driverService.update(id, updates), (result, set) => {
          set((state: AppState) => ({
            entities: {
              ...state.entities,
              drivers: state.entities.drivers.map(d => d.id === id ? result.driver as Driver : d),
            },
          }));
        }),

      deleteDriver: (id) =>
        get()._mutateEntity('drivers', () => driverService.delete(id), (_, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, drivers: state.entities.drivers.filter(d => d.id !== id) },
          }));
        }),

      generateDriverOtp: (id) => driverService.generateOtp(id),
      getDriverQrCode: (id) => driverService.getQrCode(id),

      // ============================================
      // ROUTE ACTIONS
      // ============================================

      fetchRoutes: (force = false) =>
        get()._fetchEntity('routes', () => routeService.getAll(), 'routes', CACHE_TTL.MEDIUM, force),

      createRoute: (data) =>
        get()._mutateEntity('routes', () => routeService.create(data), (result, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, routes: [...state.entities.routes, result.route as TransportRoute] },
          }));
        }),

      updateRoute: (id, updates) =>
        get()._mutateEntity('routes', () => routeService.update(id, updates), (result, set) => {
          set((state: AppState) => ({
            entities: {
              ...state.entities,
              routes: state.entities.routes.map(r => r.id === id ? result.route as TransportRoute : r),
            },
          }));
        }),

      deleteRoute: (id) =>
        get()._mutateEntity('routes', () => routeService.delete(id), (_, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, routes: state.entities.routes.filter(r => r.id !== id) },
          }));
        }),

      exportRoutes: (format) => routeService.exportRoutes(format),

      // ============================================
      // TRIP ACTIONS
      // ============================================

      fetchTrips: (force = false) =>
        get()._fetchEntity('trips', () => tripService.getAll(), 'trips', CACHE_TTL.SHORT, force),

      flagTripIncident: (id, reason) => tripService.flagIncident(id, reason),
      getTripPlayback: (id) => tripService.getPlayback(id),
      getTripStats: (period) => tripService.getStats(period),

      // ============================================
      // STUDENT ACTIONS
      // ============================================

      fetchStudents: (force = false) =>
        get()._fetchEntity('students', () => studentService.getAll(), 'students', CACHE_TTL.MEDIUM, force),

      createStudent: (data) =>
        get()._mutateEntity('students', () => studentService.create(data), (result, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, students: [...state.entities.students, result.student as Student] },
          }));
        }),

      updateStudent: (id, updates) =>
        get()._mutateEntity('students', () => studentService.update(id, updates), (result, set) => {
          set((state: AppState) => ({
            entities: {
              ...state.entities,
              students: state.entities.students.map(s => s.id === id ? result.student as Student : s),
            },
          }));
        }),

      deleteStudent: (id) =>
        get()._mutateEntity('students', () => studentService.delete(id), (_, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, students: state.entities.students.filter(s => s.id !== id) },
          }));
        }),

      toggleStudentDisable: (id) => studentService.toggleDisable(id),
      transferStudent: (id, targetSchoolId) => studentService.transfer(id, targetSchoolId),
      bulkUploadStudents: (file) => studentService.bulkUpload(file),

      // ============================================
      // ASSIGNMENT ACTIONS
      // ============================================

      fetchAssignments: (force = false) =>
        get()._fetchEntity('assignments', () => assignmentService.getAll(), 'assignments', CACHE_TTL.MEDIUM, force),

      createAssignment: (data) =>
        get()._mutateEntity('assignments', () => assignmentService.create(data), (result, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, assignments: [...state.entities.assignments, result.assignment as Assignment] },
          }));
        }),

      updateAssignment: (id, updates) =>
        get()._mutateEntity('assignments', () => assignmentService.update(id, updates), (result, set) => {
          set((state: AppState) => ({
            entities: {
              ...state.entities,
              assignments: state.entities.assignments.map(a => a.id === id ? result.assignment as Assignment : a),
            },
          }));
        }),

      deleteAssignment: (id) =>
        get()._mutateEntity('assignments', () => assignmentService.delete(id), (_, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, assignments: state.entities.assignments.filter(a => a.id !== id) },
          }));
        }),

      getAssignmentConflicts: () => assignmentService.getConflicts(),

      // ============================================
      // SHIFT ACTIONS
      // ============================================

      fetchShifts: (force = false) =>
        get()._fetchEntity('shifts', () => shiftService.getAll(), 'shifts', CACHE_TTL.MEDIUM, force),

      createShift: (data) =>
        get()._mutateEntity('shifts', () => shiftService.create(data), (result, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, shifts: [...state.entities.shifts, result.shift as Shift] },
          }));
        }),

      updateShift: (id, updates) =>
        get()._mutateEntity('shifts', () => shiftService.update(id, updates), (result, set) => {
          set((state: AppState) => ({
            entities: {
              ...state.entities,
              shifts: state.entities.shifts.map(s => s.id === id ? result.shift as Shift : s),
            },
          }));
        }),

      deleteShift: (id) =>
        get()._mutateEntity('shifts', () => shiftService.delete(id), (_, set) => {
          set((state: AppState) => ({
            entities: { ...state.entities, shifts: state.entities.shifts.filter(s => s.id !== id) },
          }));
        }),

      duplicateShift: (id) =>
        get()._mutateEntity('shifts', () => shiftService.duplicate(id) as Promise<Record<string, unknown>>, (result, set) => {
          if (result.shift) {
            set((state: AppState) => ({
              entities: { ...state.entities, shifts: [...state.entities.shifts, result.shift as Shift] },
            }));
          }
        }),

      // ============================================
      // NOTIFICATION ACTIONS
      // ============================================

      fetchNotifications: async () => {
        try {
          const { notifications } = await notificationService.getAll();
          set((state) => ({
            entities: { ...state.entities, notifications },
          }));
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      },

      markNotificationRead: async (id) => {
        await notificationService.markAsRead(id);
        set((state) => ({
          entities: {
            ...state.entities,
            notifications: state.entities.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
          },
        }));
      },

      markAllNotificationsRead: async () => {
        await notificationService.markAllAsRead();
        set((state) => ({
          entities: {
            ...state.entities,
            notifications: state.entities.notifications.map(n => ({ ...n, read: true })),
          },
        }));
      },

      deleteNotification: async (id) => {
        await notificationService.delete(id);
        set((state) => ({
          entities: {
            ...state.entities,
            notifications: state.entities.notifications.filter(n => n.id !== id),
          },
        }));
      },

      // ============================================
      // SETTINGS ACTIONS
      // ============================================

      fetchSettings: async () => {
        try {
          const { settings } = await settingsService.get();
          set((state) => ({
            entities: { ...state.entities, settings },
          }));
        } catch (error) {
          console.error('Failed to fetch settings:', error);
        }
      },

      updateSettings: async (updates) => {
        try {
          const { settings } = await settingsService.update(updates);
          set((state) => ({
            entities: { ...state.entities, settings: settings as SettingsData },
          }));
          return { success: true };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      },

      // ============================================
      // DASHBOARD ACTIONS
      // ============================================

      fetchDashboardMetrics: async (force = false) => {
        const { meta } = get();
        if (!force && meta.dashboard.lastFetch && Date.now() - meta.dashboard.lastFetch < CACHE_TTL.SHORT) {
          return;
        }

        set((state) => ({
          meta: { ...state.meta, dashboard: { ...state.meta.dashboard, loading: true, error: null } },
        }));

        try {
          const { metrics } = await dashboardService.getMetrics();
          set((state) => ({
            entities: { ...state.entities, dashboardMetrics: metrics },
            meta: { ...state.meta, dashboard: { loading: false, error: null, lastFetch: Date.now() } },
          }));
        } catch (error) {
          set((state) => ({
            meta: { ...state.meta, dashboard: { ...state.meta.dashboard, loading: false, error: (error as Error).message } },
          }));
        }
      },

      // ============================================
      // UI ACTIONS
      // ============================================

      setActivePage: (page) => {
        set((state) => ({ ui: { ...state.ui, activePage: page } }));
      },

      setSelectedSchool: (schoolId) => {
        set((state) => ({ ui: { ...state.ui, selectedSchoolId: schoolId } }));
      },

      toggleSidebar: () => {
        set((state) => ({ ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } }));
      },

      // ============================================
      // BULK REFRESH
      // ============================================

      refreshAll: async (force = false) => {
        const store = get();
        await Promise.all([
          store.fetchSchools(force),
          store.fetchDrivers(force),
          store.fetchRoutes(force),
          store.fetchTrips(force),
          store.fetchStudents(force),
          store.fetchNotifications(),
        ]);
      },
    }),
    { name: 'AppStore' }
  )
);

export default useAppStore;
