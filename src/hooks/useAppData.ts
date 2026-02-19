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
 * 6. SELECTOR OPTIMIZATION — Entity hooks read only the slice they need from Redux.
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
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type {
  School,
  TransportRoute,
  Trip,
  Driver,
  Student,
  Assignment,
  Shift,
  Notification,
} from '../../types';

// Import all thunks from slices
import { loginUser, logoutUser, setUser } from '../store/slices/authSlice';
import {
  fetchSchools, createSchool, updateSchool, deleteSchool,
  fetchDrivers, createDriver, updateDriver, deleteDriver, generateDriverOtp, getDriverQrCode,
  fetchRoutes, createRoute, updateRoute, deleteRoute, exportRoutes,
  fetchTrips, flagTripIncident, getTripPlayback, getTripStats,
  fetchStudents, createStudent, updateStudent, deleteStudent, toggleStudentDisable, transferStudent, bulkUploadStudents,
  fetchAssignments, createAssignment, updateAssignment, deleteAssignment, getAssignmentConflicts,
  fetchShifts, createShift, updateShift, deleteShift, duplicateShift,
  fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
  fetchSettings as fetchSettingsEntity, updateSettings as updateSettingsEntity,
  fetchDashboardMetrics,
} from '../store/slices/entitiesSlice';
import { setActivePage, setSelectedSchool, toggleSidebar } from '../store/slices/uiSlice';

// ============================================
// MAIN HOOK — All entities, all actions
// ============================================

/**
 * Primary data hook providing centralized access to every entity and action.
 * Use this when a component needs data from multiple entities.
 * For single-entity access, prefer the specialized hooks below.
 */
export const useAppData = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Select all state
  const auth = useSelector((state: RootState) => state.auth);
  const entities = useSelector((state: RootState) => state.entities);
  const ui = useSelector((state: RootState) => state.ui);

  // Auto-fetch all entities on mount with intelligent sequencing
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Phase 1: Independent entities (parallel — no dependencies)
        await Promise.all([
          dispatch(fetchSchools({})),
          dispatch(fetchDrivers({})),
          dispatch(fetchStudents({})),
          dispatch(fetchNotifications(undefined)),
        ]);

        // Phase 2: Routes depend on schools being loaded
        await dispatch(fetchRoutes({}));

        // Phase 3: Trips depend on routes being loaded
        await dispatch(fetchTrips({}));

        // Phase 4: Operational entities
        await Promise.all([
          dispatch(fetchAssignments({})),
          dispatch(fetchShifts({})),
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
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: (credentials: any) => dispatch(loginUser(credentials)),
    logout: () => dispatch(logoutUser()),
    setUser: (user: any) => dispatch(setUser(user)),

    // ── Entities ──
    schools: entities.schools,
    drivers: entities.drivers,
    routes: entities.routes,
    trips: entities.trips,
    students: entities.students,
    assignments: entities.assignments,
    shifts: entities.shifts,
    notifications: entities.notifications,
    settings: entities.settings,
    dashboardMetrics: entities.dashboardMetrics,

    // ── Meta (loading/error per entity) ──
    meta: entities.meta,

    // ── UI State ──
    ui,
    setActivePage: (page: string) => dispatch(setActivePage(page)),
    setSelectedSchool: (schoolId: string) => dispatch(setSelectedSchool(schoolId)),
    toggleSidebar: () => dispatch(toggleSidebar()),

    // ── School actions ──
    createSchool: (data: Partial<School>) => dispatch(createSchool(data)),
    updateSchool: (id: string, updates: Partial<School>) => dispatch(updateSchool({ id, updates })),
    deleteSchool: (id: string) => dispatch(deleteSchool(id)),
    refreshSchools: () => dispatch(fetchSchools({ force: true })),

    // ── Driver actions ──
    createDriver: (data: Partial<Driver>) => dispatch(createDriver(data)),
    updateDriver: (id: string, updates: Partial<Driver>) => dispatch(updateDriver({ id, updates })),
    deleteDriver: (id: string) => dispatch(deleteDriver(id)),
    refreshDrivers: () => dispatch(fetchDrivers({ force: true })),
    generateDriverOtp: async (id: string) => {
      const result = await dispatch(generateDriverOtp(id));
      if (generateDriverOtp.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error('Failed to generate OTP');
    },
    getDriverQrCode: async (id: string) => {
      const result = await dispatch(getDriverQrCode(id));
      if (getDriverQrCode.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error('Failed to get QR code');
    },

    // ── Route actions ──
    createRoute: (data: Partial<TransportRoute>) => dispatch(createRoute(data)),
    updateRoute: (id: string, updates: Partial<TransportRoute>) => dispatch(updateRoute({ id, updates })),
    deleteRoute: (id: string) => dispatch(deleteRoute(id)),
    refreshRoutes: () => dispatch(fetchRoutes({ force: true })),
    exportRoutes: (format?: string) => dispatch(exportRoutes(format)),

    // ── Trip actions ──
    refreshTrips: () => dispatch(fetchTrips({ force: true })),
    flagTripIncident: (id: string, reason: string) => dispatch(flagTripIncident({ id, reason })),
    getTripPlayback: (id: string) => dispatch(getTripPlayback(id)),
    getTripStats: (period?: string) => dispatch(getTripStats(period)),

    // ── Student actions ──
    createStudent: (data: Partial<Student>) => dispatch(createStudent(data)),
    updateStudent: (id: string, updates: Partial<Student>) => dispatch(updateStudent({ id, updates })),
    deleteStudent: (id: string) => dispatch(deleteStudent(id)),
    refreshStudents: () => dispatch(fetchStudents({ force: true })),
    toggleStudentDisable: (id: string) => dispatch(toggleStudentDisable(id)),
    transferStudent: (id: string, targetSchoolId: string) => dispatch(transferStudent({ id, targetSchoolId })),
    bulkUploadStudents: (file: File) => dispatch(bulkUploadStudents(file)),

    // ── Assignment actions ──
    createAssignment: (data: Partial<Assignment>) => dispatch(createAssignment(data)),
    updateAssignment: (id: string, updates: Partial<Assignment>) => dispatch(updateAssignment({ id, updates })),
    deleteAssignment: (id: string) => dispatch(deleteAssignment(id)),
    refreshAssignments: () => dispatch(fetchAssignments({ force: true })),
    getAssignmentConflicts: () => dispatch(getAssignmentConflicts()),

    // ── Shift actions ──
    createShift: (data: Partial<Shift>) => dispatch(createShift(data)),
    updateShift: (id: string, updates: Partial<Shift>) => dispatch(updateShift({ id, updates })),
    deleteShift: (id: string) => dispatch(deleteShift(id)),
    duplicateShift: (id: string) => dispatch(duplicateShift(id)),
    refreshShifts: () => dispatch(fetchShifts({ force: true })),

    // ── Notification actions ──
    markNotificationRead: (id: string) => dispatch(markNotificationRead(id)),
    markAllNotificationsRead: () => dispatch(markAllNotificationsRead()),
    deleteNotification: (id: string) => dispatch(deleteNotification(id)),

    // ── Settings actions ──
    updateSettings: (updates: any) => dispatch(updateSettingsEntity(updates)),

    // ── Dashboard ──
    fetchDashboardMetrics: (force = false) => dispatch(fetchDashboardMetrics({ force })),

    // ── Bulk ──
    refreshAll: async (force = false) => {
      await Promise.all([
        dispatch(fetchSchools({ force })),
        dispatch(fetchDrivers({ force })),
        dispatch(fetchRoutes({ force })),
        dispatch(fetchTrips({ force })),
        dispatch(fetchStudents({ force })),
        dispatch(fetchNotifications()),
      ]);
    },
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
  const dispatch = useDispatch<AppDispatch>();
  const schools = useSelector((state: RootState) => state.entities.schools);
  const meta = useSelector((state: RootState) => state.entities.meta.schools);
  const selectedSchoolId = useSelector((state: RootState) => state.ui.selectedSchoolId);

  useEffect(() => {
    dispatch(fetchSchools({}));
  }, [dispatch]);

  const selectedSchool = useMemo(
    () => selectedSchoolId ? schools.find((s: School) => s.id === selectedSchoolId) : null,
    [schools, selectedSchoolId]
  );

  return {
    schools,
    selectedSchool,
    createSchool: (data: Partial<School>) => dispatch(createSchool(data)),
    updateSchool: (id: string, updates: Partial<School>) => dispatch(updateSchool({ id, updates })),
    deleteSchool: (id: string) => dispatch(deleteSchool(id)),
    refreshSchools: () => dispatch(fetchSchools({ force: true })),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Driver data with CRUD and special actions (OTP, QR).
 */
export const useDriverData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const drivers = useSelector((state: RootState) => state.entities.drivers);
  const meta = useSelector((state: RootState) => state.entities.meta.drivers);

  useEffect(() => {
    dispatch(fetchDrivers({}));
  }, [dispatch]);

  return {
    drivers,
    createDriver: (data: Partial<Driver>) => dispatch(createDriver(data)),
    updateDriver: (id: string, updates: Partial<Driver>) => dispatch(updateDriver({ id, updates })),
    deleteDriver: (id: string) => dispatch(deleteDriver(id)),
    refreshDrivers: () => dispatch(fetchDrivers({ force: true })),
    generateOtp: async (id: string) => {
      const result = await dispatch(generateDriverOtp(id));
      if (generateDriverOtp.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error('Failed to generate OTP');
    },
    getQrCode: async (id: string) => {
      const result = await dispatch(getDriverQrCode(id));
      if (getDriverQrCode.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error('Failed to get QR code');
    },
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Route data with automatic school-based filtering.
 * `routes` = filtered by selected school. `allRoutes` = unfiltered.
 */
export const useRouteData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const routes = useSelector((state: RootState) => state.entities.routes);
  const schools = useSelector((state: RootState) => state.entities.schools);
  const selectedSchoolId = useSelector((state: RootState) => state.ui.selectedSchoolId);
  const meta = useSelector((state: RootState) => state.entities.meta.routes);

  useEffect(() => {
    dispatch(fetchRoutes({}));
  }, [dispatch]);

  // Derived: filter routes by selected school
  const filteredRoutes = useMemo(
    () => selectedSchoolId ? routes.filter((r: TransportRoute) => r.schoolId === selectedSchoolId) : routes,
    [routes, selectedSchoolId]
  );

  return {
    routes: filteredRoutes,
    allRoutes: routes,
    schools,
    createRoute: (data: Partial<TransportRoute>) => dispatch(createRoute(data)),
    updateRoute: (id: string, updates: Partial<TransportRoute>) => dispatch(updateRoute({ id, updates })),
    deleteRoute: (id: string) => dispatch(deleteRoute(id)),
    refreshRoutes: () => dispatch(fetchRoutes({ force: true })),
    exportRoutes: (format?: string) => dispatch(exportRoutes(format)),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Trip data with automatic school-based filtering (through routes).
 * `trips` = filtered. `allTrips` = unfiltered.
 */
export const useTripData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const trips = useSelector((state: RootState) => state.entities.trips);
  const routes = useSelector((state: RootState) => state.entities.routes);
  const selectedSchoolId = useSelector((state: RootState) => state.ui.selectedSchoolId);
  const meta = useSelector((state: RootState) => state.entities.meta.trips);

  useEffect(() => {
    dispatch(fetchTrips({}));
  }, [dispatch]);

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
    refreshTrips: () => dispatch(fetchTrips({ force: true })),
    flagIncident: (id: string, reason: string) => dispatch(flagTripIncident({ id, reason })),
    getPlayback: (id: string) => dispatch(getTripPlayback(id)),
    getStats: (period?: string) => dispatch(getTripStats(period)),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Student data with CRUD and special actions (disable, transfer, bulk upload).
 */
export const useStudentData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const students = useSelector((state: RootState) => state.entities.students);
  const meta = useSelector((state: RootState) => state.entities.meta.students);

  useEffect(() => {
    dispatch(fetchStudents({}));
  }, [dispatch]);

  return {
    students,
    createStudent: (data: Partial<Student>) => dispatch(createStudent(data)),
    updateStudent: (id: string, updates: Partial<Student>) => dispatch(updateStudent({ id, updates })),
    deleteStudent: (id: string) => dispatch(deleteStudent(id)),
    refreshStudents: () => dispatch(fetchStudents({ force: true })),
    toggleDisable: (id: string) => dispatch(toggleStudentDisable(id)),
    transfer: (id: string, targetSchoolId: string) => dispatch(transferStudent({ id, targetSchoolId })),
    bulkUpload: (file: File) => dispatch(bulkUploadStudents(file)),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Assignment data with CRUD and conflict detection.
 */
export const useAssignmentData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const assignments = useSelector((state: RootState) => state.entities.assignments);
  const meta = useSelector((state: RootState) => state.entities.meta.assignments);

  useEffect(() => {
    dispatch(fetchAssignments({}));
  }, [dispatch]);

  return {
    assignments,
    createAssignment: (data: Partial<Assignment>) => dispatch(createAssignment(data)),
    updateAssignment: (id: string, updates: Partial<Assignment>) => dispatch(updateAssignment({ id, updates })),
    deleteAssignment: (id: string) => dispatch(deleteAssignment(id)),
    refreshAssignments: () => dispatch(fetchAssignments({ force: true })),
    getConflicts: () => dispatch(getAssignmentConflicts()),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Shift data with CRUD and duplicate action.
 */
export const useShiftData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const shifts = useSelector((state: RootState) => state.entities.shifts);
  const meta = useSelector((state: RootState) => state.entities.meta.shifts);

  useEffect(() => {
    dispatch(fetchShifts({}));
  }, [dispatch]);

  return {
    shifts,
    createShift: (data: Partial<Shift>) => dispatch(createShift(data)),
    updateShift: (id: string, updates: Partial<Shift>) => dispatch(updateShift({ id, updates })),
    deleteShift: (id: string) => dispatch(deleteShift(id)),
    duplicateShift: (id: string) => dispatch(duplicateShift(id)),
    refreshShifts: () => dispatch(fetchShifts({ force: true })),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Auth hook — login, logout, user state.
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login: (credentials: any) => dispatch(loginUser(credentials)),
    logout: () => dispatch(logoutUser()),
    setUser: (user: any) => dispatch(setUser(user)),
  };
};

/**
 * Notification hook with unread count.
 */
export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.entities.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const unreadCount = useMemo(
    () => notifications.filter((n: Notification) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => dispatch(markNotificationRead(id)),
    markAllAsRead: () => dispatch(markAllNotificationsRead()),
    deleteNotification: (id: string) => dispatch(deleteNotification(id)),
    refresh: () => dispatch(fetchNotifications()),
  };
};

/**
 * Settings hook — loads on mount if not already loaded.
 */
export const useSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.entities.settings);
  const meta = useSelector((state: RootState) => state.entities.meta.settings);

  useEffect(() => {
    if (!settings) dispatch(fetchSettingsEntity());
  }, [settings, dispatch]);

  return {
    settings,
    updateSettings: (updates: any) => dispatch(updateSettingsEntity(updates)),
    isLoading: meta.loading,
    error: meta.error,
  };
};

/**
 * Dashboard metrics hook — fetches on mount with short TTL.
 */
export const useDashboardData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const metrics = useSelector((state: RootState) => state.entities.dashboardMetrics);
  const routes = useSelector((state: RootState) => state.entities.routes);
  const meta = useSelector((state: RootState) => state.entities.meta.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardMetrics({}));
    dispatch(fetchRoutes({}));
  }, [dispatch]);

  return {
    metrics,
    routes,
    refresh: () => dispatch(fetchDashboardMetrics({ force: true })),
    isLoading: meta.loading,
    error: meta.error,
  };
};