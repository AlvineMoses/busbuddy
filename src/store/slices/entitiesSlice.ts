/**
 * Entities Slice - Redux Toolkit
 *
 * SMART DATA-FLOW Principles:
 * ─────────────────────────────
 * 1. SINGLE SOURCE OF TRUTH — All entity data lives here.
 * 2. IMMUTABLE UPDATES — Redux Toolkit handles immutability via Immer.
 * 3. DERIVED STATE — Computed via selectors in hooks (useAppData), not stored.
 * 4. CENTRALIZED META — Loading, error, and lastFetch timestamps per entity.
 * 5. CACHE-AWARE FETCHING — Each fetch checks staleness before hitting the API.
 * 6. ENTITY-AGNOSTIC HELPERS — Generic thunk creators reduce boilerplate.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  School,
  TransportRoute,
  Trip,
  Driver,
  Student,
  Assignment,
  Shift,
  Notification,
} from '../../../types';
import type { SettingsData, DashboardMetricsResult } from '../../services/UnifiedApiService';
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
} from '../../services/UnifiedApiService';
import type { RootState } from '../index';

// ============================================
// TYPES
// ============================================

interface EntityMeta {
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

export interface EntitiesState {
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

  // Meta state for each entity
  meta: {
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
  };
}

// ============================================
// CACHE TTL CONSTANTS (milliseconds)
// ============================================
export const CACHE_TTL = {
  SHORT:  60_000,    // 1 minute
  MEDIUM: 300_000,   // 5 minutes
  LONG:   900_000,   // 15 minutes
};

// ============================================
// INITIAL STATE
// ============================================

const createEntityMeta = (): EntityMeta => ({
  loading: false,
  error: null,
  lastFetch: null,
});

const initialState: EntitiesState = {
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
};

// ============================================
// HELPER: Cache-aware fetch checker
// ============================================

const shouldFetch = (state: RootState, entityKey: keyof EntitiesState['meta'], ttl: number, force: boolean) => {
  if (force) return true;
  const meta = state.entities.meta[entityKey];
  if (!meta.lastFetch) return true;
  return Date.now() - meta.lastFetch >= ttl;
};

// ============================================
// ASYNC THUNKS - SCHOOLS
// ============================================

export const fetchSchools = createAsyncThunk(
  'entities/fetchSchools',
  async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!shouldFetch(state, 'schools', CACHE_TTL.MEDIUM, force)) {
      return { schools: state.entities.schools, skipUpdate: true };
    }
    try {
      const result = await schoolService.getAll();
      return { schools: result.schools, skipUpdate: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createSchool = createAsyncThunk(
  'entities/createSchool',
  async (data: Partial<School>, { rejectWithValue }) => {
    try {
      const result = await schoolService.create(data);
      return result.school;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateSchool = createAsyncThunk(
  'entities/updateSchool',
  async ({ id, updates }: { id: string; updates: Partial<School> }, { rejectWithValue }) => {
    try {
      const result = await schoolService.update(id, updates);
      return { id, school: result.school };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteSchool = createAsyncThunk(
  'entities/deleteSchool',
  async (id: string, { rejectWithValue }) => {
    try {
      await schoolService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - DRIVERS
// ============================================

export const fetchDrivers = createAsyncThunk(
  'entities/fetchDrivers',
  async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!shouldFetch(state, 'drivers', CACHE_TTL.MEDIUM, force)) {
      return { drivers: state.entities.drivers, skipUpdate: true };
    }
    try {
      const result = await driverService.getAll();
      return { drivers: result.drivers, skipUpdate: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createDriver = createAsyncThunk(
  'entities/createDriver',
  async (data: Partial<Driver>, { rejectWithValue }) => {
    try {
      const result = await driverService.create(data);
      return result.driver;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateDriver = createAsyncThunk(
  'entities/updateDriver',
  async ({ id, updates }: { id: string; updates: Partial<Driver> }, { rejectWithValue }) => {
    try {
      const result = await driverService.update(id, updates);
      return { id, driver: result.driver };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteDriver = createAsyncThunk(
  'entities/deleteDriver',
  async (id: string, { rejectWithValue }) => {
    try {
      await driverService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const generateDriverOtp = createAsyncThunk(
  'entities/generateDriverOtp',
  async (id: string, { rejectWithValue }) => {
    try {
      return await driverService.generateOtp(id);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getDriverQrCode = createAsyncThunk(
  'entities/getDriverQrCode',
  async (id: string, { rejectWithValue }) => {
    try {
      return await driverService.getQrCode(id);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - ROUTES
// ============================================

export const fetchRoutes = createAsyncThunk(
  'entities/fetchRoutes',
  async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!shouldFetch(state, 'routes', CACHE_TTL.MEDIUM, force)) {
      return { routes: state.entities.routes, skipUpdate: true };
    }
    try {
      const result = await routeService.getAll();
      return { routes: result.routes, skipUpdate: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createRoute = createAsyncThunk(
  'entities/createRoute',
  async (data: Partial<TransportRoute>, { rejectWithValue }) => {
    try {
      const result = await routeService.create(data);
      return result.route;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateRoute = createAsyncThunk(
  'entities/updateRoute',
  async ({ id, updates }: { id: string; updates: Partial<TransportRoute> }, { rejectWithValue }) => {
    try {
      const result = await routeService.update(id, updates);
      return { id, route: result.route };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteRoute = createAsyncThunk(
  'entities/deleteRoute',
  async (id: string, { rejectWithValue }) => {
    try {
      await routeService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const exportRoutes = createAsyncThunk(
  'entities/exportRoutes',
  async (format: string | undefined, { rejectWithValue }) => {
    try {
      return await routeService.exportRoutes(format);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - TRIPS
// ============================================

export const fetchTrips = createAsyncThunk(
  'entities/fetchTrips',
  async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!shouldFetch(state, 'trips', CACHE_TTL.SHORT, force)) {
      return { trips: state.entities.trips, skipUpdate: true };
    }
    try {
      const result = await tripService.getAll();
      return { trips: result.trips, skipUpdate: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const flagTripIncident = createAsyncThunk(
  'entities/flagTripIncident',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      return await tripService.flagIncident(id, reason);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getTripPlayback = createAsyncThunk(
  'entities/getTripPlayback',
  async (id: string, { rejectWithValue }) => {
    try {
      return await tripService.getPlayback(id);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getTripStats = createAsyncThunk(
  'entities/getTripStats',
  async (period: string | undefined, { rejectWithValue }) => {
    try {
      return await tripService.getStats(period);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - STUDENTS
// ============================================

export const fetchStudents = createAsyncThunk(
  'entities/fetchStudents',
  async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!shouldFetch(state, 'students', CACHE_TTL.MEDIUM, force)) {
      return { students: state.entities.students, skipUpdate: true };
    }
    try {
      const result = await studentService.getAll();
      return { students: result.students, skipUpdate: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createStudent = createAsyncThunk(
  'entities/createStudent',
  async (data: Partial<Student>, { rejectWithValue }) => {
    try {
      const result = await studentService.create(data);
      return result.student;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateStudent = createAsyncThunk(
  'entities/updateStudent',
  async ({ id, updates }: { id: string; updates: Partial<Student> }, { rejectWithValue }) => {
    try {
      const result = await studentService.update(id, updates);
      return { id, student: result.student };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'entities/deleteStudent',
  async (id: string, { rejectWithValue }) => {
    try {
      await studentService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const toggleStudentDisable = createAsyncThunk(
  'entities/toggleStudentDisable',
  async (id: string, { rejectWithValue }) => {
    try {
      return await studentService.toggleDisable(id);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const transferStudent = createAsyncThunk(
  'entities/transferStudent',
  async ({ id, targetSchoolId }: { id: string; targetSchoolId: string }, { rejectWithValue }) => {
    try {
      return await studentService.transfer(id, targetSchoolId);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const bulkUploadStudents = createAsyncThunk(
  'entities/bulkUploadStudents',
  async (file: File, { rejectWithValue }) => {
    try {
      return await studentService.bulkUpload(file);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - ASSIGNMENTS
// ============================================

export const fetchAssignments = createAsyncThunk(
  'entities/fetchAssignments',
  async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!shouldFetch(state, 'assignments', CACHE_TTL.MEDIUM, force)) {
      return { assignments: state.entities.assignments, skipUpdate: true };
    }
    try {
      const result = await assignmentService.getAll();
      return { assignments: result.assignments, skipUpdate: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createAssignment = createAsyncThunk(
  'entities/createAssignment',
  async (data: Partial<Assignment>, { rejectWithValue }) => {
    try {
      const result = await assignmentService.create(data);
      return result.assignment;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'entities/updateAssignment',
  async ({ id, updates }: { id: string; updates: Partial<Assignment> }, { rejectWithValue }) => {
    try {
      const result = await assignmentService.update(id, updates);
      return { id, assignment: result.assignment };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'entities/deleteAssignment',
  async (id: string, { rejectWithValue }) => {
    try {
      await assignmentService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getAssignmentConflicts = createAsyncThunk(
  'entities/getAssignmentConflicts',
  async (_, { rejectWithValue }) => {
    try {
      return await assignmentService.getConflicts();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - SHIFTS
// ============================================

export const fetchShifts = createAsyncThunk(
  'entities/fetchShifts',
  async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!shouldFetch(state, 'shifts', CACHE_TTL.MEDIUM, force)) {
      return { shifts: state.entities.shifts, skipUpdate: true };
    }
    try {
      const result = await shiftService.getAll();
      return { shifts: result.shifts, skipUpdate: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createShift = createAsyncThunk(
  'entities/createShift',
  async (data: Partial<Shift>, { rejectWithValue }) => {
    try {
      const result = await shiftService.create(data);
      return result.shift;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateShift = createAsyncThunk(
  'entities/updateShift',
  async ({ id, updates }: { id: string; updates: Partial<Shift> }, { rejectWithValue }) => {
    try {
      const result = await shiftService.update(id, updates);
      return { id, shift: result.shift };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteShift = createAsyncThunk(
  'entities/deleteShift',
  async (id: string, { rejectWithValue }) => {
    try {
      await shiftService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const duplicateShift = createAsyncThunk(
  'entities/duplicateShift',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await shiftService.duplicate(id);
      return result.shift;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - NOTIFICATIONS
// ============================================

export const fetchNotifications = createAsyncThunk(
  'entities/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const result = await notificationService.getAll();
      return result.notifications;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'entities/markNotificationRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'entities/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return null;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'entities/deleteNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - SETTINGS
// ============================================

export const fetchSettings = createAsyncThunk(
  'entities/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const result = await settingsService.get();
      return result.settings;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'entities/updateSettings',
  async (updates: Partial<SettingsData>, { rejectWithValue }) => {
    try {
      const result = await settingsService.update(updates);
      return result.settings;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// ASYNC THUNKS - DASHBOARD
// ============================================

export const fetchDashboardMetrics = createAsyncThunk(
  'entities/fetchDashboardMetrics',
  async ({ force = false }: { force?: boolean } = {}, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!shouldFetch(state, 'dashboard', CACHE_TTL.SHORT, force)) {
      return { metrics: state.entities.dashboardMetrics, skipUpdate: true };
    }
    try {
      const result = await dashboardService.getMetrics();
      return { metrics: result.metrics, skipUpdate: false };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// ============================================
// SLICE
// ============================================

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ============================================
    // SCHOOLS
    // ============================================
    builder
      .addCase(fetchSchools.pending, (state) => {
        state.meta.schools.loading = true;
        state.meta.schools.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        if (!action.payload.skipUpdate) {
          state.schools = action.payload.schools;
          state.meta.schools.lastFetch = Date.now();
        }
        state.meta.schools.loading = false;
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.meta.schools.loading = false;
        state.meta.schools.error = action.payload as string;
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.schools.push(action.payload as School);
      })
      .addCase(updateSchool.fulfilled, (state, action) => {
        const index = state.schools.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.schools[index] = action.payload.school as School;
        }
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.schools = state.schools.filter(s => s.id !== action.payload);
      });

    // ============================================
    // DRIVERS
    // ============================================
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.meta.drivers.loading = true;
        state.meta.drivers.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        if (!action.payload.skipUpdate) {
          state.drivers = action.payload.drivers;
          state.meta.drivers.lastFetch = Date.now();
        }
        state.meta.drivers.loading = false;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.meta.drivers.loading = false;
        state.meta.drivers.error = action.payload as string;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.drivers.push(action.payload as Driver);
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.drivers[index] = action.payload.driver as Driver;
        }
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter(d => d.id !== action.payload);
      });

    // ============================================
    // ROUTES
    // ============================================
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.meta.routes.loading = true;
        state.meta.routes.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        if (!action.payload.skipUpdate) {
          state.routes = action.payload.routes;
          state.meta.routes.lastFetch = Date.now();
        }
        state.meta.routes.loading = false;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.meta.routes.loading = false;
        state.meta.routes.error = action.payload as string;
      })
      .addCase(createRoute.fulfilled, (state, action) => {
        state.routes.push(action.payload as TransportRoute);
      })
      .addCase(updateRoute.fulfilled, (state, action) => {
        const index = state.routes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.routes[index] = action.payload.route as TransportRoute;
        }
      })
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.routes = state.routes.filter(r => r.id !== action.payload);
      });

    // ============================================
    // TRIPS
    // ============================================
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.meta.trips.loading = true;
        state.meta.trips.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        if (!action.payload.skipUpdate) {
          state.trips = action.payload.trips;
          state.meta.trips.lastFetch = Date.now();
        }
        state.meta.trips.loading = false;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.meta.trips.loading = false;
        state.meta.trips.error = action.payload as string;
      });

    // ============================================
    // STUDENTS
    // ============================================
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.meta.students.loading = true;
        state.meta.students.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        if (!action.payload.skipUpdate) {
          state.students = action.payload.students;
          state.meta.students.lastFetch = Date.now();
        }
        state.meta.students.loading = false;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.meta.students.loading = false;
        state.meta.students.error = action.payload as string;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.students.push(action.payload as Student);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload.student as Student;
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(s => s.id !== action.payload);
      });

    // ============================================
    // ASSIGNMENTS
    // ============================================
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.meta.assignments.loading = true;
        state.meta.assignments.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        if (!action.payload.skipUpdate) {
          state.assignments = action.payload.assignments;
          state.meta.assignments.lastFetch = Date.now();
        }
        state.meta.assignments.loading = false;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.meta.assignments.loading = false;
        state.meta.assignments.error = action.payload as string;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.assignments.push(action.payload as Assignment);
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload.assignment as Assignment;
        }
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
      });

    // ============================================
    // SHIFTS
    // ============================================
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.meta.shifts.loading = true;
        state.meta.shifts.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        if (!action.payload.skipUpdate) {
          state.shifts = action.payload.shifts;
          state.meta.shifts.lastFetch = Date.now();
        }
        state.meta.shifts.loading = false;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.meta.shifts.loading = false;
        state.meta.shifts.error = action.payload as string;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.shifts.push(action.payload as Shift);
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        const index = state.shifts.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.shifts[index] = action.payload.shift as Shift;
        }
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter(s => s.id !== action.payload);
      })
      .addCase(duplicateShift.fulfilled, (state, action) => {
        state.shifts.push(action.payload as Shift);
      });

    // ============================================
    // NOTIFICATIONS
    // ============================================
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.meta.notifications.loading = true;
        state.meta.notifications.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.meta.notifications.loading = false;
        state.meta.notifications.lastFetch = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.meta.notifications.loading = false;
        state.meta.notifications.error = action.payload as string;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.read = true;
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.read = true; });
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      });

    // ============================================
    // SETTINGS
    // ============================================
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.meta.settings.loading = true;
        state.meta.settings.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload as SettingsData;
        state.meta.settings.loading = false;
        state.meta.settings.lastFetch = Date.now();
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.meta.settings.loading = false;
        state.meta.settings.error = action.payload as string;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload as SettingsData;
      });

    // ============================================
    // DASHBOARD
    // ============================================
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.meta.dashboard.loading = true;
        state.meta.dashboard.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        if (!action.payload.skipUpdate) {
          state.dashboardMetrics = action.payload.metrics;
          state.meta.dashboard.lastFetch = Date.now();
        }
        state.meta.dashboard.loading = false;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.meta.dashboard.loading = false;
        state.meta.dashboard.error = action.payload as string;
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export default entitiesSlice.reducer;
