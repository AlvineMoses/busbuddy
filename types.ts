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

// Stats
export interface DashboardMetrics {
  totalTrips: number;
  activeTrips: number;
  totalKm: number;
  onTimePercentage: number;
}
