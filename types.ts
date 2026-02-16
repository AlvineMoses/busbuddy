// Roles
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN', // Ops / Transport Control
  SCHOOL_ADMIN = 'SCHOOL_ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  schoolId?: string; // If null, has access to all (Super Admin/Admin)
}

// Schools
export interface School {
  id: string;
  name: string;
  logoUrl?: string;
}

// Routes & Status
export enum RouteHealth {
  NORMAL = 'NORMAL', // Green
  DELAYED = 'DELAYED', // Yellow
  ALERT = 'ALERT' // Red
}

export interface TransportRoute {
  id: string;
  name: string;
  schoolId: string;
  type: 'PICKUP' | 'DROPOFF';
  status: 'ACTIVE' | 'INACTIVE';
  health: RouteHealth;
  driverId: string;
  vehiclePlate: string;
}

// Trips
export interface TripEvent {
  time: string;
  description: string;
  type: 'START' | 'BOARDING' | 'DROP' | 'ALERT' | 'END';
  studentName?: string;
}

export interface Trip {
  id: string;
  routeId: string;
  driverName: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'STARTED' | 'ENDED' | 'SCHEDULED';
  riderCount: number;
  events: TripEvent[];
}

// Notifications
export enum NotificationType {
  SAFETY = 'SAFETY',
  DELAY = 'DELAY',
  ATTENDANCE = 'ATTENDANCE',
  SYSTEM = 'SYSTEM'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

// Drivers
export type DriverStatus = 'ON_TRIP' | 'AVAILABLE' | 'OFF_DUTY' | 'PENDING';

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  phone: string;
  email: string;
  license: string;
  status: DriverStatus;
  avatar: string;
  corporate: string;
}

// Students
export type StudentStatus = 'ON_BOARD' | 'DROPPED_OFF' | 'ABSENT' | 'WAITING' | 'DISABLED';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Student {
  id: string;
  name: string;
  school: string;
  grade: string;
  guardian: string;
  status: StudentStatus;
  pickupLocation?: Location;
  dropoffLocation?: Location;
  assignedRoutes?: string[]; // Route IDs this student is assigned to
}

// Assignments
export type AssignmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Assignment {
  id: string;
  routeId: string;
  routeName: string;
  school: string;
  driver: string;
  date: string;
  routeTime: string;
  routeType: 'PICKUP' | 'DROP_OFF';
  status: AssignmentStatus;
  recurring?: boolean;
  conflicts?: string[];
}

// Shifts
export type ShiftStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

export interface Shift {
  id: string;
  shiftName: string;
  shiftCode: string;
  school: string;
  drivers: string[];
  days: string[];
  scheduledTime: string;
  actualTime?: string;
  assignedRoute: string;
  status: ShiftStatus;
  notes?: string;
}

// Stats
export interface DashboardMetrics {
  totalTrips: number;
  activeTrips: number;
  totalKm: number;
  onTimePercentage: number;
}

// ============================================
// ENDPOINT CONFIGURATION
// ============================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type EndpointStatus = 'ACTIVE' | 'DEPRECATED' | 'DISABLED' | 'TESTING';
export type EnvironmentType = 'development' | 'staging' | 'production' | 'custom';

export interface EndpointEnvironment {
  id: string;
  name: string;
  description: string;
  environment: EnvironmentType;
  protocol: 'https://' | 'http://';
  baseUrl: string;
  apiPrefix: boolean;        // toggle /api/
  version: string;           // e.g. "/v1/"
  createdAt: string;
  updatedAt: string;
}

export interface EndpointDefinition {
  id: string;
  method: HttpMethod;
  environmentId: string;     // links to EndpointEnvironment
  path: string;              // e.g. "/schools" or "/schools/:id"
  description: string;
  status: EndpointStatus;
  parameters?: string;       // JSON string of query/path params
  authentication?: string;   // e.g. "Bearer Token", "API Key", "None"
  body?: string;             // JSON string of request body
  script?: string;           // pre/post-request script
  lastTested?: string;       // ISO timestamp
  lastTestResult?: 'success' | 'failure';
}

export interface EndpointMapping {
  id: string;
  endpointId: string;        // links to EndpointDefinition
  endpointPath: string;      // denormalized for display
  description: string;
  functionality: string;     // Component/Page/Feature using it
  sourceConstant: string;    // e.g. "API.SCHOOLS.BASE"
}
