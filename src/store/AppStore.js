/**
 * AppStore - Global State Management with Zustand
 * 
 * Smart Data-Flow Principles:
 * 1. Single source of truth for all entity data
 * 2. Immutable state updates
 * 3. Computed/derived state via selectors
 * 4. Centralized loading and error states
 * 5. Built-in cache management
 * 
 * State Structure:
 * - entities: { schools, drivers, routes, trips, students }
 * - auth: { user, token, isAuthenticated }
 * - ui: { activePage, selectedSchool, notifications }
 * - meta: { loading, error states per entity }
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  authService,
  schoolService,
  driverService,
  routeService,
  tripService,
  studentService,
  notificationService,
  settingsService
} from '../services/UnifiedApiService';

const useAppStore = create(
  devtools(
    (set, get) => ({
      // ============================================
      // AUTHENTICATION STATE
      // ============================================
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      },

      // ============================================
      // ENTITY DATA
      // ============================================
      entities: {
        schools: [],
        drivers: [],
        routes: [],
        trips: [],
        students: [],
        notifications: [],
        settings: null
      },

      // ============================================
      // META STATE (Loading, Errors, Last Fetch)
      // ============================================
      meta: {
        schools: { loading: false, error: null, lastFetch: null },
        drivers: { loading: false, error: null, lastFetch: null },
        routes: { loading: false, error: null, lastFetch: null },
        trips: { loading: false, error: null, lastFetch: null },
        students: { loading: false, error: null, lastFetch: null },
        notifications: { loading: false, error: null, lastFetch: null },
        settings: { loading: false, error: null, lastFetch: null }
      },

      // ============================================
      // UI STATE
      // ============================================
      ui: {
        activePage: 'dashboard',
        selectedSchoolId: '', // Empty = All Schools
        sidebarCollapsed: true
      },

      // ============================================
      // AUTHENTICATION ACTIONS
      // ============================================
      
      // Set user directly (for non-API logins)
      setUser: (user) => {
        set({
          auth: {
            user,
            token: null,
            isAuthenticated: true,
            isLoading: false,
            error: null
          }
        });
      },
      
      login: async (credentials) => {
        set((state) => ({
          auth: { ...state.auth, isLoading: true, error: null }
        }));

        try {
          const { user, token } = await authService.login(credentials);
          set({
            auth: {
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            }
          });
          return { success: true };
        } catch (error) {
          set((state) => ({
            auth: {
              ...state.auth,
              isLoading: false,
              error: error.message
            }
          }));
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        await authService.logout();
        set({
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          },
          ui: {
            activePage: 'dashboard',
            selectedSchoolId: '',
            sidebarCollapsed: true
          }
        });
      },

      setUser: (user) => {
        set((state) => ({
          auth: { ...state.auth, user, isAuthenticated: !!user }
        }));
      },

      // ============================================
      // SCHOOL ACTIONS
      // ============================================
      fetchSchools: async (force = false) => {
        const { meta } = get();
        const cacheAge = Date.now() - (meta.schools.lastFetch || 0);
        
        // Skip if recently fetched (within 5 minutes) and not forcing
        if (!force && cacheAge < 300000 && meta.schools.lastFetch) {
          return;
        }

        set((state) => ({
          meta: {
            ...state.meta,
            schools: { ...state.meta.schools, loading: true, error: null }
          }
        }));

        try {
          const { schools } = await schoolService.getAll();
          set((state) => ({
            entities: { ...state.entities, schools },
            meta: {
              ...state.meta,
              schools: { loading: false, error: null, lastFetch: Date.now() }
            }
          }));
        } catch (error) {
          set((state) => ({
            meta: {
              ...state.meta,
              schools: { ...state.meta.schools, loading: false, error: error.message }
            }
          }));
        }
      },

      createSchool: async (schoolData) => {
        try {
          const { school } = await schoolService.create(schoolData);
          set((state) => ({
            entities: {
              ...state.entities,
              schools: [...state.entities.schools, school]
            }
          }));
          return { success: true, school };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      updateSchool: async (id, updates) => {
        try {
          const { school } = await schoolService.update(id, updates);
          set((state) => ({
            entities: {
              ...state.entities,
              schools: state.entities.schools.map(s => s.id === id ? school : s)
            }
          }));
          return { success: true, school };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      deleteSchool: async (id) => {
        try {
          await schoolService.delete(id);
          set((state) => ({
            entities: {
              ...state.entities,
              schools: state.entities.schools.filter(s => s.id !== id)
            }
          }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // ============================================
      // DRIVER ACTIONS
      // ============================================
      fetchDrivers: async (force = false) => {
        const { meta } = get();
        const cacheAge = Date.now() - (meta.drivers.lastFetch || 0);
        
        if (!force && cacheAge < 300000 && meta.drivers.lastFetch) {
          return;
        }

        set((state) => ({
          meta: {
            ...state.meta,
            drivers: { ...state.meta.drivers, loading: true, error: null }
          }
        }));

        try {
          const { drivers } = await driverService.getAll();
          set((state) => ({
            entities: { ...state.entities, drivers },
            meta: {
              ...state.meta,
              drivers: { loading: false, error: null, lastFetch: Date.now() }
            }
          }));
        } catch (error) {
          set((state) => ({
            meta: {
              ...state.meta,
              drivers: { ...state.meta.drivers, loading: false, error: error.message }
            }
          }));
        }
      },

      createDriver: async (driverData) => {
        try {
          const { driver } = await driverService.create(driverData);
          set((state) => ({
            entities: {
              ...state.entities,
              drivers: [...state.entities.drivers, driver]
            }
          }));
          return { success: true, driver };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      updateDriver: async (id, updates) => {
        try {
          const { driver } = await driverService.update(id, updates);
          set((state) => ({
            entities: {
              ...state.entities,
              drivers: state.entities.drivers.map(d => d.id === id ? driver : d)
            }
          }));
          return { success: true, driver };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      deleteDriver: async (id) => {
        try {
          await driverService.delete(id);
          set((state) => ({
            entities: {
              ...state.entities,
              drivers: state.entities.drivers.filter(d => d.id !== id)
            }
          }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // ============================================
      // ROUTE ACTIONS
      // ============================================
      fetchRoutes: async (force = false) => {
        const { meta } = get();
        const cacheAge = Date.now() - (meta.routes.lastFetch || 0);
        
        if (!force && cacheAge < 300000 && meta.routes.lastFetch) {
          return;
        }

        set((state) => ({
          meta: {
            ...state.meta,
            routes: { ...state.meta.routes, loading: true, error: null }
          }
        }));

        try {
          const { routes } = await routeService.getAll();
          set((state) => ({
            entities: { ...state.entities, routes },
            meta: {
              ...state.meta,
              routes: { loading: false, error: null, lastFetch: Date.now() }
            }
          }));
        } catch (error) {
          set((state) => ({
            meta: {
              ...state.meta,
              routes: { ...state.meta.routes, loading: false, error: error.message }
            }
          }));
        }
      },

      createRoute: async (routeData) => {
        try {
          const { route } = await routeService.create(routeData);
          set((state) => ({
            entities: {
              ...state.entities,
              routes: [...state.entities.routes, route]
            }
          }));
          return { success: true, route };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      updateRoute: async (id, updates) => {
        try {
          const { route } = await routeService.update(id, updates);
          set((state) => ({
            entities: {
              ...state.entities,
              routes: state.entities.routes.map(r => r.id === id ? route : r)
            }
          }));
          return { success: true, route };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      deleteRoute: async (id) => {
        try {
          await routeService.delete(id);
          set((state) => ({
            entities: {
              ...state.entities,
              routes: state.entities.routes.filter(r => r.id !== id)
            }
          }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // ============================================
      // TRIP ACTIONS
      // ============================================
      fetchTrips: async (force = false) => {
        const { meta } = get();
        const cacheAge = Date.now() - (meta.trips.lastFetch || 0);
        
        if (!force && cacheAge < 60000 && meta.trips.lastFetch) { // 1 min cache
          return;
        }

        set((state) => ({
          meta: {
            ...state.meta,
            trips: { ...state.meta.trips, loading: true, error: null }
          }
        }));

        try {
          const { trips } = await tripService.getAll();
          set((state) => ({
            entities: { ...state.entities, trips },
            meta: {
              ...state.meta,
              trips: { loading: false, error: null, lastFetch: Date.now() }
            }
          }));
        } catch (error) {
          set((state) => ({
            meta: {
              ...state.meta,
              trips: { ...state.meta.trips, loading: false, error: error.message }
            }
          }));
        }
      },

      // ============================================
      // STUDENT ACTIONS
      // ============================================
      fetchStudents: async (force = false) => {
        const { meta } = get();
        const cacheAge = Date.now() - (meta.students.lastFetch || 0);
        
        if (!force && cacheAge < 300000 && meta.students.lastFetch) {
          return;
        }

        set((state) => ({
          meta: {
            ...state.meta,
            students: { ...state.meta.students, loading: true, error: null }
          }
        }));

        try {
          const { students } = await studentService.getAll();
          set((state) => ({
            entities: { ...state.entities, students },
            meta: {
              ...state.meta,
              students: { loading: false, error: null, lastFetch: Date.now() }
            }
          }));
        } catch (error) {
          set((state) => ({
            meta: {
              ...state.meta,
              students: { ...state.meta.students, loading: false, error: error.message }
            }
          }));
        }
      },

      createStudent: async (studentData) => {
        try {
          const { student } = await studentService.create(studentData);
          set((state) => ({
            entities: {
              ...state.entities,
              students: [...state.entities.students, student]
            }
          }));
          return { success: true, student };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      updateStudent: async (id, updates) => {
        try {
          const { student } = await studentService.update(id, updates);
          set((state) => ({
            entities: {
              ...state.entities,
              students: state.entities.students.map(s => s.id === id ? student : s)
            }
          }));
          return { success: true, student };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      deleteStudent: async (id) => {
        try {
          await studentService.delete(id);
          set((state) => ({
            entities: {
              ...state.entities,
              students: state.entities.students.filter(s => s.id !== id)
            }
          }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // ============================================
      // NOTIFICATION ACTIONS
      // ============================================
      fetchNotifications: async () => {
        try {
          const { notifications } = await notificationService.getAll();
          set((state) => ({
            entities: { ...state.entities, notifications }
          }));
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      },

      // ============================================
      // SETTINGS ACTIONS
      // ============================================
      fetchSettings: async () => {
        try {
          const { settings } = await settingsService.get();
          set((state) => ({
            entities: { ...state.entities, settings }
          }));
        } catch (error) {
          console.error('Failed to fetch settings:', error);
        }
      },

      updateSettings: async (updates) => {
        try {
          const { settings } = await settingsService.update(updates);
          set((state) => ({
            entities: { ...state.entities, settings }
          }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // ============================================
      // UI ACTIONS
      // ============================================
      setActivePage: (page) => {
        set((state) => ({
          ui: { ...state.ui, activePage: page }
        }));
      },

      setSelectedSchool: (schoolId) => {
        set((state) => ({
          ui: { ...state.ui, selectedSchoolId: schoolId }
        }));
      },

      toggleSidebar: () => {
        set((state) => ({
          ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed }
        }));
      }
    }),
    { name: 'AppStore' }
  )
);

export default useAppStore;
