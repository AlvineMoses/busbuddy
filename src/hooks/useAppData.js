/**
 * useAppData - Main data hook providing centralized access to all entities
 * 
 * Smart Data-Flow Principles:
 * 1. Single hook API for all data access
 * 2. Automatic data fetching with caching
 * 3. Optimistic updates for better UX
 * 4. Derived/computed state via selectors
 * 5. Type-safe entity operations
 * 
 * Usage:
 * const { schools, createSchool, isLoading } = useAppData();
 */

import { useEffect } from 'react';
import useAppStore from '../store/AppStore';

/**
 * Main application data hook
 */
export const useAppData = () => {
  const store = useAppStore();

  // Auto-fetch on mount if needed
  useEffect(() => {
    store.fetchSchools();
    store.fetchDrivers();
    store.fetchRoutes();
    store.fetchTrips();
    store.fetchStudents();
    store.fetchNotifications();
  }, []);

  return {
    // Auth
    user: store.auth.user,
    isAuthenticated: store.auth.isAuthenticated,
    login: store.login,
    logout: store.logout,

    // Entities
    schools: store.entities.schools,
    drivers: store.entities.drivers,
    routes: store.entities.routes,
    trips: store.entities.trips,
    students: store.entities.students,
    notifications: store.entities.notifications,
    settings: store.entities.settings,

    // Meta
    meta: store.meta,

    // UI State
    ui: store.ui,
    setActivePage: store.setActivePage,
    setSelectedSchool: store.setSelectedSchool,

    // School actions
    createSchool: store.createSchool,
    updateSchool: store.updateSchool,
    deleteSchool: store.deleteSchool,
    refreshSchools: () => store.fetchSchools(true),

    // Driver actions
    createDriver: store.createDriver,
    updateDriver: store.updateDriver,
    deleteDriver: store.deleteDriver,
    refreshDrivers: () => store.fetchDrivers(true),

    // Route actions
    createRoute: store.createRoute,
    updateRoute: store.updateRoute,
    deleteRoute: store.deleteRoute,
    refreshRoutes: () => store.fetchRoutes(true),

    // Student actions
    createStudent: store.createStudent,
    updateStudent: store.updateStudent,
    deleteStudent: store.deleteStudent,
    refreshStudents: () => store.fetchStudents(true),

    // Trip actions
    refreshTrips: () => store.fetchTrips(true),

    // Settings actions
    updateSettings: store.updateSettings
  };
};

/**
 * Specialized hook for school data
 */
export const useSchoolData = () => {
  const {
    schools,
    createSchool,
    updateSchool,
    deleteSchool,
    refreshSchools,
    meta,
    ui
  } = useAppData();

  const selectedSchool = ui.selectedSchoolId 
    ? schools.find(s => s.id === ui.selectedSchoolId)
    : null;

  return {
    schools,
    selectedSchool,
    createSchool,
    updateSchool,
    deleteSchool,
    refreshSchools,
    isLoading: meta.schools.loading,
    error: meta.schools.error
  };
};

/**
 * Specialized hook for driver data
 */
export const useDriverData = () => {
  const {
    drivers,
    createDriver,
    updateDriver,
    deleteDriver,
    refreshDrivers,
    meta
  } = useAppData();

  return {
    drivers,
    createDriver,
    updateDriver,
    deleteDriver,
    refreshDrivers,
    isLoading: meta.drivers.loading,
    error: meta.drivers.error
  };
};

/**
 * Specialized hook for route data with school filtering
 */
export const useRouteData = () => {
  const {
    routes,
    schools,
    createRoute,
    updateRoute,
    deleteRoute,
    refreshRoutes,
    meta,
    ui
  } = useAppData();

  // Filter routes by selected school
  const filteredRoutes = ui.selectedSchoolId
    ? routes.filter(r => r.schoolId === ui.selectedSchoolId)
    : routes;

  return {
    routes: filteredRoutes,
    allRoutes: routes,
    schools,
    createRoute,
    updateRoute,
    deleteRoute,
    refreshRoutes,
    isLoading: meta.routes.loading,
    error: meta.routes.error
  };
};

/**
 * Specialized hook for trip data with filtering
 */
export const useTripData = () => {
  const {
    trips,
    routes,
    refreshTrips,
    meta,
    ui
  } = useAppData();

  // Filter trips by selected school (through routes)
  const filteredTrips = ui.selectedSchoolId
    ? trips.filter(t => {
        const route = routes.find(r => r.id === t.routeId);
        return route?.schoolId === ui.selectedSchoolId;
      })
    : trips;

  return {
    trips: filteredTrips,
    allTrips: trips,
    refreshTrips,
    isLoading: meta.trips.loading,
    error: meta.trips.error
  };
};

/**
 * Specialized hook for student data
 */
export const useStudentData = () => {
  const {
    students,
    createStudent,
    updateStudent,
    deleteStudent,
    refreshStudents,
    meta
  } = useAppData();

  return {
    students,
    createStudent,
    updateStudent,
    deleteStudent,
    refreshStudents,
    isLoading: meta.students.loading,
    error: meta.students.error
  };
};

/**
 * Hook for authentication
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    meta
  } = useAppData();

  return {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading: useAppStore(state => state.auth.isLoading),
    error: useAppStore(state => state.auth.error)
  };
};

/**
 * Hook for notifications
 */
export const useNotifications = () => {
  const { notifications } = useAppData();

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount
  };
};

/**
 * Hook for settings
 */
export const useSettings = () => {
  const { settings, updateSettings, meta } = useAppData();

  useEffect(() => {
    const store = useAppStore.getState();
    if (!settings) {
      store.fetchSettings();
    }
  }, [settings]);

  return {
    settings,
    updateSettings,
    isLoading: meta.settings.loading
  };
};
