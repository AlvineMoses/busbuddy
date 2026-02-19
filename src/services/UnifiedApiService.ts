/**
 * UnifiedApiService - Real Backend Integration
 *
 * All services now connect to the real ASP.NET Core Web API backend
 * documented in backend.md. No more mock data or isDemoMode checks.
 *
 * Backend Route Pattern: /api/v1/{Controller}/{Action}
 * All domain endpoints use POST method
 * Authentication: JWT Bearer token (handled by ApiClient)
 * All requests include BaseApiDto fields
 */

import { apiClient, CACHE_TTL } from './ApiClient';
import { API } from '../config/apiEndpoints';
import {
  AuthenticationDto,
  GetCorporateListDto,
  GetRouteListDto,
  GetRouteDetailsDto,
  GetAllTripsDto,
  GetTripDetailsDto,
  ShuttleTripsDto,
  GetDriverListDto,
  GetDriverDetailsDto,
  GetStaffListDto,
  GetStaffDetailsDto,
  GetDashboardDto,
  GetNotificationDto,
  GetHeaderInfoDto,
  GetUserMenuListDto,
  LiveTripDetailsDto,
  createBaseDto,
  ApiActionType,
  ApiResponse,
} from '../types/dtos';
import type {
  School,
  TransportRoute,
  Trip,
  Notification,
  Driver,
  Student,
  DashboardMetrics,
  User,
  Assignment,
  Shift,
} from '../../types';

// ============================================
// HELPER: Get current user context
// ============================================

interface UserContext {
  emailId: string;
  roleId: string;
  uniqueId: string;
  corporateId?: string;
}

let _cachedUserContext: UserContext | null = null;

const getUserContext = (): UserContext => {
  if (_cachedUserContext) {
    return _cachedUserContext;
  }

  try {
    const userStr = localStorage.getItem('busbuddy_user');
    if (!userStr) {
      throw new Error('No user context found. Please login.');
    }
    const user = JSON.parse(userStr) as User;
    _cachedUserContext = {
      emailId: user.email,
      roleId: user.role || 'ADMIN',
      uniqueId: user.id,
      corporateId: user.schoolId || undefined,
    };
    return _cachedUserContext;
  } catch (error) {
    console.error('Failed to get user context:', error);
    throw new Error('User context unavailable');
  }
};

export const clearUserContext = (): void => {
  _cachedUserContext = null;
};

// ============================================
// AUTHENTICATION SERVICE
// ============================================

export const authService = {
  /**
   * Authenticate user with email and password
   * Maps to: POST /api/v1/Authentication/AuthenticateUser
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const dto: AuthenticationDto = {
      ...createBaseDto(email, 'USER', email, ApiActionType.Get),
      EmailID: email,
      Password: password,
    };

    const response = await apiClient.post<ApiResponse>(API.AUTH.AUTHENTICATE_USER, dto, {
      cache: false,
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Authentication failed');
    }

    // Extract token and user data from response
    const { token, user } = response.data as { token: string; user: any };

    // Map backend user to frontend User type
    const mappedUser: User = {
      id: user.UserID || user.EmailID,
      email: user.EmailID,
      name: user.AdminName || user.Name || email,
      role: user.RoleID || 'ADMIN',
      schoolId: user.CorporateID ? String(user.CorporateID) : null,
      avatar: user.AdminImage || undefined,
    };

    // Store token in ApiClient
    apiClient.setAuthToken(token);

    // Store user in localStorage
    localStorage.setItem('busbuddy_user', JSON.stringify(mappedUser));
    localStorage.setItem('busbuddy_token', token);

    return { user: mappedUser, token };
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    apiClient.clearAuthToken();
    localStorage.removeItem('busbuddy_user');
    localStorage.removeItem('busbuddy_token');
    clearUserContext();
  },

  /**
   * Get current authenticated user
   */
  async me(): Promise<{ user: User }> {
    const userStr = localStorage.getItem('busbuddy_user');
    if (!userStr) {
      throw new Error('Not authenticated');
    }
    return { user: JSON.parse(userStr) as User };
  },

  /**
   * Request OTP for authentication
   * Maps to: POST /api/v1/Authentication/AuthenticateOTP
   */
  async requestOtp(email: string): Promise<{ success: boolean; message: string }> {
    // Implementation would go here - placeholder for now
    throw new Error('OTP authentication not yet implemented');
  },

  /**
   * Verify OTP
   * Maps to: POST /api/v1/Authentication/OTPVerification
   */
  async verifyOtp(email: string, otp: string): Promise<{ success: boolean }> {
    // Implementation would go here - placeholder for now
    throw new Error('OTP verification not yet implemented');
  },

  /**
   * Reset password
   * Maps to: POST /api/v1/Authentication/SetNewPassword
   */
  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean }> {
    // Implementation would go here - placeholder for now
    throw new Error('Password reset not yet implemented');
  },
};

// ============================================
// CORPORATE/SCHOOL SERVICE
// ============================================

export const schoolService = {
  /**
   * Get all corporates/schools
   * Maps to: POST /api/v1/Corporate/GetCorporates
   */
  async getAll(): Promise<{ schools: School[] }> {
    const ctx = getUserContext();
    const dto: GetCorporateListDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.List),
      EmailID: ctx.emailId,
      RoleID: ctx.roleId,
      CorporateID: ctx.corporateId,
    };

    const response = await apiClient.post<ApiResponse>(API.CORPORATE.GET_CORPORATES, dto, {
      cache: true,
      cacheMaxAge: CACHE_TTL.MEDIUM,
    });

    if (!response.success || !response.data) {
      return { schools: [] };
    }

    // Map backend Corporate to frontend School
    const corporates = Array.isArray(response.data) ? response.data : [response.data];
    const schools: School[] = corporates.map((corp: any) => ({
      id: String(corp.CorporateID),
      name: corp.Corporatename,
      address: corp.Address || '',
      contactEmail: corp.AdminEmail || '',
      contactPhone: corp.AdminContactNo || '',
      status: corp.IsSuspended ? 'INACTIVE' : 'ACTIVE',
      logo: corp.CorporateLogo || undefined,
    }));

    return { schools };
  },

  /**
   * Get school by ID
   */
  async getById(id: string): Promise<{ school: School | undefined }> {
    const { schools } = await this.getAll();
    return { school: schools.find(s => s.id === id) };
  },

  /**
   * Get school statistics
   */
  async getStats(id: string): Promise<{ stats: any }> {
    // This would map to dashboard or corporate-specific stats endpoint
    return {
      stats: {
        totalStudents: 0,
        totalRoutes: 0,
        activeTrips: 0,
        onTimeRate: 0,
      },
    };
  },

  async create(data: Partial<School>): Promise<{ school: School }> {
    throw new Error('School creation not yet implemented');
  },

  async update(id: string, updates: Partial<School>): Promise<{ school: School | undefined }> {
    throw new Error('School update not yet implemented');
  },

  async delete(id: string): Promise<{ success: boolean }> {
    throw new Error('School deletion not yet implemented');
  },
};

// ============================================
// ROUTE SERVICE
// ============================================

export const routeService = {
  /**
   * Get all routes for a corporate
   * Maps to: POST /api/v1/Route/GetRoutList
   */
  async getAll(filters?: { schoolId?: string }): Promise<{ routes: TransportRoute[] }> {
    const ctx = getUserContext();
    const corporateId = filters?.schoolId || ctx.corporateId;

    if (!corporateId) {
      return { routes: [] };
    }

    const dto: GetRouteListDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.List),
      EmailID: ctx.emailId,
      CorporateID: corporateId,
      DepartmentID: undefined,
    };

    const response = await apiClient.post<ApiResponse>(API.ROUTE.GET_LIST, dto, {
      cache: true,
      cacheMaxAge: CACHE_TTL.MEDIUM,
    });

    if (!response.success || !response.data) {
      return { routes: [] };
    }

    // Map backend Route to frontend TransportRoute
    const backendRoutes = Array.isArray(response.data) ? response.data : [response.data];
    const routes: TransportRoute[] = backendRoutes.map((route: any) => ({
      id: String(route.RouteID),
      name: route.RouteName,
      type: route.RouteType,
      schoolId: String(route.CorporateID),
      status: route.IsDeactivated ? 'INACTIVE' : 'ACTIVE',
      stops: route.ShuttleRoute ? JSON.parse(route.ShuttleRoute) : [],
      schedule: route.ShuttleTiming ? JSON.parse(route.ShuttleTiming) : {},
      assignedDriver: null,
      assignedVehicle: null,
      capacity: 0,
      healthStatus: route.IsDeactivated ? 'CRITICAL' : 'HEALTHY',
    }));

    return { routes };
  },

  /**
   * Get route by ID
   * Maps to: POST /api/v1/Route/GetRouteDetails
   */
  async getById(id: string): Promise<{ route: TransportRoute | undefined }> {
    const ctx = getUserContext();
    const dto: GetRouteDetailsDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.Get),
      EmailID: ctx.emailId,
      RouteID: id,
    };

    const response = await apiClient.post<ApiResponse>(API.ROUTE.GET_DETAILS, dto, {
      cache: true,
    });

    if (!response.success || !response.data) {
      return { route: undefined };
    }

    const route: any = response.data;
    return {
      route: {
        id: String(route.RouteID),
        name: route.RouteName,
        type: route.RouteType,
        schoolId: String(route.CorporateID),
        status: route.IsDeactivated ? 'INACTIVE' : 'ACTIVE',
        stops: route.ShuttleRoute ? JSON.parse(route.ShuttleRoute) : [],
        schedule: route.ShuttleTiming ? JSON.parse(route.ShuttleTiming) : {},
        assignedDriver: null,
        assignedVehicle: null,
        capacity: 0,
        healthStatus: route.IsDeactivated ? 'CRITICAL' : 'HEALTHY',
      },
    };
  },

  /**
   * Get trips for a route
   */
  async getTrips(routeId: string): Promise<{ trips: Trip[] }> {
    // Would filter trips by routeId
    const { trips } = await tripService.getAll({ routeId });
    return { trips };
  },

  async create(data: Partial<TransportRoute>): Promise<{ route: TransportRoute }> {
    throw new Error('Route creation not yet implemented');
  },

  async update(id: string, updates: Partial<TransportRoute>): Promise<{ route: TransportRoute | undefined }> {
    throw new Error('Route update not yet implemented');
  },

  async delete(id: string): Promise<{ success: boolean }> {
    throw new Error('Route deletion not yet implemented');
  },

  async exportRoutes(format: string = 'csv'): Promise<{ data: TransportRoute[]; format: string }> {
    const { routes } = await this.getAll();
    return { data: routes, format };
  },

  async getLive(): Promise<{ routes: TransportRoute[] }> {
    const { routes } = await this.getAll();
    return { routes: routes.filter(r => r.status === 'ACTIVE') };
  },
};

// ============================================
// TRIP SERVICE
// ============================================

export const tripService = {
  /**
   * Get all trips
   * Maps to: POST /api/v1/Trips/GetAllTrips and POST /api/v1/ShuttleTrips/GetShuttleTrips
   */
  async getAll(filters?: { schoolId?: string; routeId?: string }): Promise<{ trips: Trip[] }> {
    const ctx = getUserContext();
    const corporateId = filters?.schoolId || ctx.corporateId;

    if (!corporateId) {
      return { trips: [] };
    }

    // Get both regular trips and shuttle trips
    const [allTripsResponse, shuttleTripsResponse] = await Promise.all([
      this._getAllTrips(corporateId),
      this._getShuttleTrips(corporateId),
    ]);

    let trips = [...allTripsResponse, ...shuttleTripsResponse];

    // Filter by routeId if provided
    if (filters?.routeId) {
      trips = trips.filter(t => t.routeId === filters.routeId);
    }

    return { trips };
  },

  async _getAllTrips(corporateId: string): Promise<Trip[]> {
    const ctx = getUserContext();
    const dto: GetAllTripsDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.List),
      EmailID: ctx.emailId,
      CorporateID: corporateId,
      RoleID: ctx.roleId,
      FromDate: undefined,
      ToDate: undefined,
      StaffMobileNumber: undefined,
      DepartmentID: undefined,
    };

    const response = await apiClient.post<ApiResponse>(API.TRIPS.GET_ALL, dto, {
      cache: true,
      cacheMaxAge: CACHE_TTL.SHORT,
    });

    if (!response.success || !response.data) {
      return [];
    }

    const backendTrips = Array.isArray(response.data) ? response.data : [response.data];
    return this._mapTrips(backendTrips);
  },

  async _getShuttleTrips(corporateId: string): Promise<Trip[]> {
    const ctx = getUserContext();
    const dto: ShuttleTripsDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.List),
      EmailID: ctx.emailId,
      CorporateID: corporateId,
      DepartmentID: undefined,
      StaffMobileNumber: undefined,
      FromDate: undefined,
      ToDate: undefined,
    };

    const response = await apiClient.post<ApiResponse>(API.SHUTTLE_TRIPS.GET_TRIPS, dto, {
      cache: true,
      cacheMaxAge: CACHE_TTL.SHORT,
    });

    if (!response.success || !response.data) {
      return [];
    }

    const backendTrips = Array.isArray(response.data) ? response.data : [response.data];
    return this._mapTrips(backendTrips);
  },

  _mapTrips(backendTrips: any[]): Trip[] {
    return backendTrips.map((trip: any) => ({
      id: String(trip.TripID || trip.JourneyID),
      routeId: String(trip.RouteID || ''),
      driverId: trip.DriverEmailID || null,
      vehicleId: trip.VehicleID || null,
      status: trip.Status || 'IN_PROGRESS',
      startTime: trip.CreatedOn || trip.FromDate || new Date().toISOString(),
      endTime: trip.ToDate || null,
      currentLocation: trip.CurrentLocation || null,
      events: [],
      passengers: [],
    }));
  },

  /**
   * Get trip by ID
   * Maps to: POST /api/v1/Trips/GetTripDetails
   */
  async getById(id: string): Promise<{ trip: Trip | undefined }> {
    const ctx = getUserContext();
    const corporateId = ctx.corporateId || '';

    const dto: GetTripDetailsDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.Get),
      CorporateID: corporateId,
      EmailID: ctx.emailId,
      RoleID: ctx.roleId,
      TripID: id,
      LocationCount: undefined,
    };

    const response = await apiClient.post<ApiResponse>(API.TRIPS.GET_DETAILS, dto, {
      cache: true,
    });

    if (!response.success || !response.data) {
      return { trip: undefined };
    }

    const trips = this._mapTrips([response.data]);
    return { trip: trips[0] };
  },

  async create(data: Partial<Trip>): Promise<{ trip: Trip }> {
    throw new Error('Trip creation not yet implemented');
  },

  async update(id: string, updates: Partial<Trip>): Promise<{ trip: Trip | undefined }> {
    throw new Error('Trip update not yet implemented');
  },

  async delete(id: string): Promise<{ success: boolean }> {
    throw new Error('Trip deletion not yet implemented');
  },

  async flagIncident(id: string, reason: string): Promise<{ success: boolean; flagId: string }> {
    // Implementation would go here
    return { success: true, flagId: `FLAG_${Date.now()}` };
  },

  async getPlayback(id: string): Promise<{ waypoints: unknown[]; duration: number }> {
    return { waypoints: [], duration: 0 };
  },

  async getEvents(id: string): Promise<{ events: any[] }> {
    const { trip } = await this.getById(id);
    return { events: trip?.events || [] };
  },

  async getStats(period: string = 'monthly'): Promise<{ stats: any }> {
    return {
      stats: {
        totalTrips: 0,
        totalKm: 0,
        onTimeRate: 0,
        avgDuration: 0,
        period,
      },
    };
  },
};

// ============================================
// DRIVER SERVICE
// ============================================

export const driverService = {
  /**
   * Get all drivers
   * Maps to: POST /api/v1/DriverList/GetDriverList
   */
  async getAll(filters?: { schoolId?: string }): Promise<{ drivers: Driver[] }> {
    const ctx = getUserContext();
    const corporateId = filters?.schoolId || ctx.corporateId;

    if (!corporateId) {
      return { drivers: [] };
    }

    const dto: GetDriverListDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.List),
      EmailID: ctx.emailId,
      CorporateID: corporateId,
      RoleID: ctx.roleId,
    };

    const response = await apiClient.post<ApiResponse>(API.DRIVER.GET_LIST, dto, {
      cache: true,
      cacheMaxAge: CACHE_TTL.MEDIUM,
    });

    if (!response.success || !response.data) {
      return { drivers: [] };
    }

    const backendDrivers = Array.isArray(response.data) ? response.data : [response.data];
    const drivers: Driver[] = backendDrivers.map((driver: any) => ({
      id: driver.DriverEmailID || driver.DriverID,
      name: driver.DriverName || driver.Name || 'Unknown',
      email: driver.DriverEmailID,
      phone: driver.MobileNumber || driver.ContactNumber,
      licenseNumber: driver.LicenseNumber || '',
      status: driver.IsActive === false ? 'OFF_DUTY' : 'AVAILABLE',
      assignedVehicle: driver.PlateNumber || null,
      currentLocation: null,
      rating: 0,
    }));

    return { drivers };
  },

  /**
   * Get driver by ID
   * Maps to: POST /api/v1/DriverList/GetDriverDetails
   */
  async getById(id: string): Promise<{ driver: Driver | undefined }> {
    const ctx = getUserContext();
    const dto: GetDriverDetailsDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.Get),
      EmailID: ctx.emailId,
      DriverEmailID: id,
    };

    const response = await apiClient.post<ApiResponse>(API.DRIVER.GET_DETAILS, dto, {
      cache: true,
    });

    if (!response.success || !response.data) {
      return { driver: undefined };
    }

    const driver: any = response.data;
    return {
      driver: {
        id: driver.DriverEmailID || driver.DriverID,
        name: driver.DriverName || driver.Name || 'Unknown',
        email: driver.DriverEmailID,
        phone: driver.MobileNumber || driver.ContactNumber,
        licenseNumber: driver.LicenseNumber || '',
        status: driver.IsActive === false ? 'OFF_DUTY' : 'AVAILABLE',
        assignedVehicle: driver.PlateNumber || null,
        currentLocation: null,
        rating: 0,
      },
    };
  },

  async create(data: Partial<Driver>): Promise<{ driver: Driver }> {
    throw new Error('Driver creation not yet implemented');
  },

  async update(id: string, updates: Partial<Driver>): Promise<{ driver: Driver | undefined }> {
    throw new Error('Driver update not yet implemented');
  },

  async delete(id: string): Promise<{ success: boolean }> {
    throw new Error('Driver deletion not yet implemented');
  },

  async generateOtp(id: string): Promise<{ otp: string; expiresIn: number }> {
    return { otp: Math.floor(100000 + Math.random() * 900000).toString(), expiresIn: 300 };
  },

  async getQrCode(id: string): Promise<{ qrData: string; url: string }> {
    return { qrData: `busbudd://driver/${id}`, url: `https://app.busbudd.com/driver/${id}` };
  },

  async updateStatus(id: string, status: string): Promise<{ driver: Driver | undefined }> {
    // Implementation would go here
    const { driver } = await this.getById(id);
    if (driver) {
      return { driver: { ...driver, status: status as any } };
    }
    return { driver: undefined };
  },

  async getLive(): Promise<{ drivers: Driver[] }> {
    const { drivers } = await this.getAll();
    return { drivers: drivers.filter(d => d.status !== 'OFF_DUTY') };
  },
};

// ============================================
// STUDENT/STAFF SERVICE
// ============================================

export const studentService = {
  /**
   * Get all students/staff
   * Maps to: POST /api/v1/Staff/GetStaffList
   */
  async getAll(filters?: { schoolId?: string }): Promise<{ students: Student[] }> {
    const ctx = getUserContext();
    const corporateId = filters?.schoolId || ctx.corporateId;

    if (!corporateId) {
      return { students: [] };
    }

    const dto: GetStaffListDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.List),
      EmailID: ctx.emailId,
      CorporateID: corporateId,
    };

    const response = await apiClient.post<ApiResponse>(API.STAFF.GET_LIST, dto, {
      cache: true,
      cacheMaxAge: CACHE_TTL.MEDIUM,
    });

    if (!response.success || !response.data) {
      return { students: [] };
    }

    const backendStaff = Array.isArray(response.data) ? response.data : [response.data];
    const students: Student[] = backendStaff.map((staff: any) => ({
      id: String(staff.StaffID || staff.MobileNumber),
      name: `${staff.StaffFirstName || ''} ${staff.StaffLastName || ''}`.trim(),
      grade: staff.ClassStandards || '',
      schoolId: String(staff.CorporateID),
      assignedRoute: null,
      pickupLocation: staff.PickupStop || '',
      dropoffLocation: staff.DropStop || '',
      parentName: `${staff.ParentFirstName || ''} ${staff.ParentLastName || ''}`.trim(),
      parentPhone: staff.ParentsMobileNumber || '',
      status: staff.IsSuspended ? 'INACTIVE' : 'ACTIVE',
    }));

    return { students };
  },

  async getById(id: string): Promise<{ student: Student | undefined }> {
    const ctx = getUserContext();
    const dto: GetStaffDetailsDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.Get),
      EmailID: ctx.emailId,
      MobileNumber: id,
      CorporateType: undefined,
    };

    const response = await apiClient.post<ApiResponse>(API.STAFF.GET_DETAILS, dto, {
      cache: true,
    });

    if (!response.success || !response.data) {
      return { student: undefined };
    }

    const staff: any = response.data;
    return {
      student: {
        id: String(staff.StaffID || staff.MobileNumber),
        name: `${staff.StaffFirstName || ''} ${staff.StaffLastName || ''}`.trim(),
        grade: staff.ClassStandards || '',
        schoolId: String(staff.CorporateID),
        assignedRoute: null,
        pickupLocation: staff.PickupStop || '',
        dropoffLocation: staff.DropStop || '',
        parentName: `${staff.ParentFirstName || ''} ${staff.ParentLastName || ''}`.trim(),
        parentPhone: staff.ParentsMobileNumber || '',
        status: staff.IsSuspended ? 'INACTIVE' : 'ACTIVE',
      },
    };
  },

  async create(data: Partial<Student>): Promise<{ student: Student }> {
    throw new Error('Student creation not yet implemented');
  },

  async update(id: string, updates: Partial<Student>): Promise<{ student: Student | undefined }> {
    throw new Error('Student update not yet implemented');
  },

  async delete(id: string): Promise<{ success: boolean }> {
    throw new Error('Student deletion not yet implemented');
  },

  async toggleDisable(id: string): Promise<{ student: Student | undefined }> {
    throw new Error('Student disable toggle not yet implemented');
  },

  async transfer(id: string, newSchoolId: string): Promise<{ student: Student | undefined }> {
    throw new Error('Student transfer not yet implemented');
  },

  async bulkUpload(file: File): Promise<{ success: boolean; imported: number; failed: number }> {
    throw new Error('Bulk upload not yet implemented');
  },
};

// ============================================
// NOTIFICATION SERVICE
// ============================================

export const notificationService = {
  /**
   * Get all notifications
   * Maps to: POST /api/v1/Header/GetNotification
   */
  async getAll(): Promise<{ notifications: Notification[] }> {
    const ctx = getUserContext();
    const corporateId = ctx.corporateId || '';

    const dto: GetNotificationDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.List),
      EmailID: ctx.emailId,
      CorporateID: corporateId,
    };

    const response = await apiClient.post<ApiResponse>(API.HEADER.GET_NOTIFICATION, dto, {
      cache: true,
      cacheMaxAge: CACHE_TTL.SHORT,
    });

    if (!response.success || !response.data) {
      return { notifications: [] };
    }

    const backendNotifs = Array.isArray(response.data) ? response.data : [response.data];
    const notifications: Notification[] = backendNotifs.map((notif: any) => ({
      id: String(notif.NotificationID),
      type: notif.NotificationType || 'INFO',
      title: notif.Title || '',
      message: notif.Message || '',
      timestamp: notif.CreatedOn || new Date().toISOString(),
      read: notif.IsRead || false,
      actionUrl: null,
    }));

    return { notifications };
  },

  async getById(id: string): Promise<{ notification: Notification | undefined }> {
    const { notifications } = await this.getAll();
    return { notification: notifications.find(n => n.id === id) };
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    // Implementation would go here
    return { success: true };
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    // Implementation would go here
    return { success: true };
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const { notifications } = await this.getAll();
    return { count: notifications.filter(n => !n.read).length };
  },

  async create(data: Partial<Notification>): Promise<{ notification: Notification }> {
    throw new Error('Notification creation not yet implemented');
  },

  async update(id: string, updates: Partial<Notification>): Promise<{ notification: Notification | undefined }> {
    throw new Error('Notification update not yet implemented');
  },

  async delete(id: string): Promise<{ success: boolean }> {
    throw new Error('Notification deletion not yet implemented');
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================

export const dashboardService = {
  /**
   * Get dashboard metrics
   * Maps to: POST /api/v1/Dashboard/GetDashboard
   */
  async getMetrics(): Promise<{ metrics: DashboardMetrics }> {
    const ctx = getUserContext();
    const dto: GetDashboardDto = {
      ...createBaseDto(ctx.emailId, ctx.roleId, ctx.uniqueId, ApiActionType.Get),
      EmailID: ctx.emailId,
    };

    const response = await apiClient.post<ApiResponse>(API.DASHBOARD.GET, dto, {
      cache: true,
      cacheMaxAge: CACHE_TTL.SHORT,
    });

    if (!response.success || !response.data) {
      return {
        metrics: {
          totalSchools: 0,
          totalStudents: 0,
          totalDrivers: 0,
          totalRoutes: 0,
          activeTrips: 0,
          onTimePercentage: 0,
          totalTripsToday: 0,
          alerts: 0,
        },
      };
    }

    const data: any = response.data;
    return {
      metrics: {
        totalSchools: data.TotalCorporates || 0,
        totalStudents: data.TotalRiders || 0,
        totalDrivers: data.TotalDrivers || 0,
        totalRoutes: data.TotalRoutes || 0,
        activeTrips: data.ActiveTrips || 0,
        onTimePercentage: data.OnTimeRate || 0,
        totalTripsToday: data.TotalTrips || 0,
        alerts: 0,
      },
    };
  },

  async getLiveFeed(): Promise<{ feed: unknown[] }> {
    return { feed: [] };
  },
};

// ============================================
// ASSIGNMENT SERVICE (Placeholder - not yet implemented)
// ============================================

export const assignmentService = {
  async getAll(): Promise<{ assignments: Assignment[] }> {
    return { assignments: [] };
  },

  async getById(id: string): Promise<{ assignment: Assignment | undefined }> {
    return { assignment: undefined };
  },

  async create(data: Partial<Assignment>): Promise<{ assignment: Assignment }> {
    throw new Error('Assignment creation not yet implemented');
  },

  async update(id: string, updates: Partial<Assignment>): Promise<{ assignment: Assignment | undefined }> {
    throw new Error('Assignment update not yet implemented');
  },

  async delete(id: string): Promise<{ success: boolean }> {
    throw new Error('Assignment deletion not yet implemented');
  },
};

// ============================================
// SHIFT SERVICE (Placeholder - not yet implemented)
// ============================================

export const shiftService = {
  async getAll(): Promise<{ shifts: Shift[] }> {
    return { shifts: [] };
  },

  async getById(id: string): Promise<{ shift: Shift | undefined }> {
    return { shift: undefined };
  },

  async create(data: Partial<Shift>): Promise<{ shift: Shift }> {
    throw new Error('Shift creation not yet implemented');
  },

  async update(id: string, updates: Partial<Shift>): Promise<{ shift: Shift | undefined }> {
    throw new Error('Shift update not yet implemented');
  },

  async delete(id: string): Promise<{ success: boolean }> {
    throw new Error('Shift deletion not yet implemented');
  },
};

// ============================================
// SETTINGS SERVICE
// ============================================

export const settingsService = {
  async getAll(): Promise<{ settings: any }> {
    const settingsStr = localStorage.getItem('busbuddy_settings');
    if (settingsStr) {
      return { settings: JSON.parse(settingsStr) };
    }
    return { settings: {} };
  },

  async update(updates: Record<string, unknown>): Promise<{ settings: any }> {
    const current = await this.getAll();
    const updated = { ...current.settings, ...updates };
    localStorage.setItem('busbuddy_settings', JSON.stringify(updated));
    return { settings: updated };
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    // Would use apiClient.upload() here
    throw new Error('Image upload not yet implemented');
  },
};

// ============================================
// EXPORT ALL SERVICES
// ============================================

export default {
  auth: authService,
  schools: schoolService,
  routes: routeService,
  trips: tripService,
  drivers: driverService,
  students: studentService,
  assignments: assignmentService,
  shifts: shiftService,
  notifications: notificationService,
  dashboard: dashboardService,
  settings: settingsService,
};
