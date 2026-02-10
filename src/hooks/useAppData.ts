/**
 * useAppData - Centralized Data Hooks for All Entities
 *
 * SMART DATA-FLOW Principles:
 * ─────────────────────────────
 * 1. SINGLE HOOK API — `useAppData()` provides access to everything.
 * 2. SPECIALIZED HOOKS — `useSchoolData()`, `useDriverData()`, etc. for focused access.
 * 3. AUTO-FETCH — Data is fetched on mount with proper cache-aware sequencing.
 * 4. DERIVED STATE — Computed filtering (by school) happens in hooks, not in store.
 * 5. CONSISTENT INTERFACE — Every entity hook returns { data, actions, isLoading, error }.
 * 6. SELECTOR OPTIMIZATION — Entity hooks read only the slice they need from Zustand.
 *
 * Usage:
 *   // Full access
 *   const { schools, drivers, createSchool, isLoading } = useAppData();
 *
 *   // Entity-specific (more performant — fewer re-renders)
 *   const { schools, createSchool, isLoading } = useSchoolData();
 *   const { drivers, updateDriver } = useDriverData();
 *   const { routes, filteredRoutes } = useRouteData();
 */

import { useEffect, useMemo } from 'react';
import useAppStore from '../store/AppStore';
import type {
  School,
  TransportRoute,
  Trip,
  Driver,
  Student,
  Assignment,
  Shift,
  Notification,
  User,
} from '../../types';
import type { SettingsData, DashboardMetricsResult } from '../services/UnifiedApiService';
import type { AppState } from '../store/AppStore';

// ============================================
// MAIN HOOK — All entities, all actions
// ============================================

/**
 * Primary data hook providing centralized access to every entity and action.
 * Use this when a component needs data from multiple entities.
 * For single-entity access, prefer the specialized hooks below.
 */
export const useAppData = () => {
  const store = useAppStore();

  // Auto-fetch all entities on mount with intelligent sequencing
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Phase 1: Independent entities (parallel — no dependencies)
        await Promise.all([
          store.fetchSchools(),
          store.fetchDrivers(),
          store.fetchStudents(),
          store.fetchNotifications(),
        ]);

        // Phase 2: Routes depend on schools being loaded
        await store.fetchRoutes();

        // Phase 3: Trips depend on routes being loaded
        await store.fetchTrips();

        // Phase 4: Operational entities
        await Promise.all([
          store.fetchAssignments(),
          store.fetchShifts(),
        ]);
      } catch (error) {
        console.error('useAppData: Data initialization failed:', error);
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // ── Auth ──
    user: store.auth.user,
    isAuthenticated: store.auth.isAuthenticated,
    login: store.login,
    logout: store.logout,

    // ── Entities ──
    schools: store.entities.schools,
    drivers: store.entities.drivers,
    routes: store.entities.routes,
    trips: store.entities.trips,
    students: store.entities.students,
    assignments: store.entities.assignments,
    shifts: store.entities.shifts,
    notifications: store.entities.notifications,
    settings: store.entities.settings,
    dashboardMetrics: store.entities.dashboardMetrics,

    // ── Meta (loading/error per entity) ──
    meta: store.meta,

    // ── UI State ──
    ui: store.ui,
    setActivePage: store.setActivePage,
    setSelectedSchool: store.setSelectedSchool,
    toggleSidebar: store.toggleSidebar,

    // ── School actions ──
    createSchool: store.createSchool,
    updateSchool: store.updateSchool,
    deleteSchool: store.deleteSchool,
    refreshSchools: () => store.fetchSchools(true),

    // ── Driver actions ──
    createDriver: store.createDriver,
    updateDriver: store.updateDriver,
    deleteDriver: store.deleteDriver,
    refreshDrivers: () => store.fetchDrivers(true),
    generateDriverOtp: store.generateDriverOtp,
    getDriverQrCode: store.getDriverQrCode,

    // ── Route actions ──
    createRoute: store.createRoute,
    updateRoute: store.updateRoute,
    deleteRoute: store.deleteRoute,
    refreshRoutes: () => store.fetchRoutes(true),
    exportRoutes: store.exportRoutes,

    // ── Trip actions ──
    refreshTrips: () => store.fetchTrips(true),
    flagTripIncident: store.flagTripIncident,
    getTripPlayback: store.getTripPlayback,
    getTripStats: store.getTripStats,

    // ── Student actions ──
    createStudent: store.createStudent,
    updateStudent: store.updateStudent,
    deleteStudent: store.deleteStudent,
    refreshStudents: () => store.fetchStudents(true),
    toggleStudentDisable: store.toggleStudentDisable,
    transferStudent: store.transferStudent,
    bulkUploadStudents: store.bulkUploadStudents,

    // ── Assignment actions ──
    createAssignment: store.createAssignment,
    updateAssignment: store.updateAssignment,
    deleteAssignment: store.deleteAssignment,
    refreshAssignments: () => store.fetchAssignments(true),
    getAssignmentConflicts: store.getAssignmentConflicts,

    // ── Shift actions ──
    createShift: store.createShift,
    updateShift: store.updateShift,
    deleteShift: store.deleteShift,
    duplicateShift: store.duplicateShift,
    refreshShifts: () => store.fetchShifts(true),

    // ── Notification actions ──
    markNotificationRead: store.markNotificationRead,
    markAllNotificationsRead: store.markAllNotificationsRead,
    deleteNotification: store.deleteNotification,

    // ── Settings actions ──
    updateSettings: store.updateSettings,

    // ── Dashboard ──
    fetchDashboardMetrics: store.fetchDashboardMetrics,

    // ── Bulk ──
    refreshAll: store.refreshAll,
  };
};

// ============================================
// SPECIALIZED HOOKS — Entity-Specific
// ============================================

/**
 * School data with school-level filtering and CRUD.
 * Reads only schools slice — fewer re-renders than useAppData.
 */
export const useSchoolData = () => {
  const schools = useAppStore((state: AppState) => state.entities.schools);
  const meta = useAppStore((state: AppState) => state.meta.schools);
  const selectedSchoolId = useAppStore((state: AppState) => state.ui.selectedSchoolId);
  const {
    fetchSchools, createSchool, updateSchool, deleteSchool,
  } = useAppStore();

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const selectedSchool = useMemo(
    () => selectedSchoolId ? schools.find((s: School) => s.id === selectedSchoolId) : null,
    [schools, selectedSchoolId]
  );

  return {
    schools,
    selectedSchool,
    createSchool,
    updateSchool,
    deleteSchool,
    refreshSchools: () => fetchSchools(true),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Driver data with CRUD and special actions (OTP, QR).
 */
export const useDriverData = () => {
  const drivers = useAppStore((state: AppState) => state.entities.drivers);
  const meta = useAppStore((state: AppState) => state.meta.drivers);
  const {
    fetchDrivers, createDriver, updateDriver, deleteDriver,
    generateDriverOtp, getDriverQrCode,
  } = useAppStore();

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  return {
    drivers,
    createDriver,
    updateDriver,
    deleteDriver,
    refreshDrivers: () => fetchDrivers(true),
    generateOtp: generateDriverOtp,
    getQrCode: getDriverQrCode,
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Route data with automatic school-based filtering.
 * `routes` = filtered by selected school. `allRoutes` = unfiltered.
 */
export const useRouteData = () => {
  const routes = useAppStore((state: AppState) => state.entities.routes);
  const schools = useAppStore((state: AppState) => state.entities.schools);
  const selectedSchoolId = useAppStore((state: AppState) => state.ui.selectedSchoolId);
  const meta = useAppStore((state: AppState) => state.meta.routes);
  const {
    fetchRoutes, createRoute, updateRoute, deleteRoute, exportRoutes,
  } = useAppStore();

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  // Derived: filter routes by selected school
  const filteredRoutes = useMemo(
    () => selectedSchoolId ? routes.filter((r: TransportRoute) => r.schoolId === selectedSchoolId) : routes,
    [routes, selectedSchoolId]
  );

  return {
    routes: filteredRoutes,
    allRoutes: routes,
    schools,
    createRoute,
    updateRoute,
    deleteRoute,
    refreshRoutes: () => fetchRoutes(true),
    exportRoutes,
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Trip data with automatic school-based filtering (through routes).
 * `trips` = filtered. `allTrips` = unfiltered.
 */
export const useTripData = () => {
  const trips = useAppStore((state: AppState) => state.entities.trips);
  const routes = useAppStore((state: AppState) => state.entities.routes);
  const selectedSchoolId = useAppStore((state: AppState) => state.ui.selectedSchoolId);
  const meta = useAppStore((state: AppState) => state.meta.trips);
  const {
    fetchTrips, flagTripIncident, getTripPlayback, getTripStats,
  } = useAppStore();

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // Derived: filter trips by selected school (through route.schoolId)
  const filteredTrips = useMemo(
    () => {
      if (!selectedSchoolId) return trips;
      return trips.filter((t: Trip) => {
        const route = routes.find((r: TransportRoute) => r.id === t.routeId);
        return route?.schoolId === selectedSchoolId;
      });
    },
    [trips, routes, selectedSchoolId]
  );

  return {
    trips: filteredTrips,
    allTrips: trips,
    refreshTrips: () => fetchTrips(true),
    flagIncident: flagTripIncident,
    getPlayback: getTripPlayback,
    getStats: getTripStats,
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Student data with CRUD and special actions (disable, transfer, bulk upload).
 */
export const useStudentData = () => {
  const students = useAppStore((state: AppState) => state.entities.students);
  const meta = useAppStore((state: AppState) => state.meta.students);
  const {
    fetchStudents, createStudent, updateStudent, deleteStudent,
    toggleStudentDisable, transferStudent, bulkUploadStudents,
  } = useAppStore();

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return {
    students,
    createStudent,
    updateStudent,
    deleteStudent,
    refreshStudents: () => fetchStudents(true),
    toggleDisable: toggleStudentDisable,
    transfer: transferStudent,
    bulkUpload: bulkUploadStudents,
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Assignment data with CRUD and conflict detection.
 */
export const useAssignmentData = () => {
  const assignments = useAppStore((state: AppState) => state.entities.assignments);
  const meta = useAppStore((state: AppState) => state.meta.assignments);
  const {
    fetchAssignments, createAssignment, updateAssignment, deleteAssignment,
    getAssignmentConflicts,
  } = useAppStore();

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  return {
    assignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    refreshAssignments: () => fetchAssignments(true),
    getConflicts: getAssignmentConflicts,
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Shift data with CRUD and duplicate action.
 */
export const useShiftData = () => {
  const shifts = useAppStore((state: AppState) => state.entities.shifts);
  const meta = useAppStore((state: AppState) => state.meta.shifts);
  const {
    fetchShifts, createShift, updateShift, deleteShift, duplicateShift,
  } = useAppStore();

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  return {
    shifts,
    createShift,
    updateShift,
    deleteShift,
    duplicateShift,
    refreshShifts: () => fetchShifts(true),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Auth hook — login, logout, user state.
 */
export const useAuth = () => {
  const user = useAppStore((state: AppState) => state.auth.user);
  const isAuthenticated = useAppStore((state: AppState) => state.auth.isAuthenticated);
  const isLoading = useAppStore((state: AppState) => state.auth.isLoading);
  const error = useAppStore((state: AppState) => state.auth.error);
  const { login, logout, setUser } = useAppStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setUser,
  };
};

/**
 * Notification hook with unread count.
 */
export const useNotifications = () => {
  const notifications = useAppStore((state: AppState) => state.entities.notifications);
  const {
    fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
  } = useAppStore();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n: Notification) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    markAsRead: markNotificationRead,
    markAllAsRead: markAllNotificationsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
};

/**
 * Settings hook — loads on mount if not already loaded.
 */
export const useSettings = () => {
  const settings = useAppStore((state: AppState) => state.entities.settings);
  const meta = useAppStore((state: AppState) => state.meta.settings);
  const { fetchSettings, updateSettings } = useAppStore();

  useEffect(() => {
    if (!settings) fetchSettings();
  }, [settings, fetchSettings]);

  return {
    settings,
    updateSettings,
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Dashboard metrics hook — fetches on mount with short TTL.
 */
export const useDashboardData = () => {
  const metrics = useAppStore((state: AppState) => state.entities.dashboardMetrics);
  const routes = useAppStore((state: AppState) => state.entities.routes);
  const meta = useAppStore((state: AppState) => state.meta.dashboard);
  const { fetchDashboardMetrics, fetchRoutes } = useAppStore();

  useEffect(() => {
    fetchDashboardMetrics();
    fetchRoutes();
  }, [fetchDashboardMetrics, fetchRoutes]);

  return {
    metrics,
    routes,
    refresh: () => fetchDashboardMetrics(true),
    isLoading: meta.loading,
    error: meta.error,
  };
};
