import { UserRole, User, School, TransportRoute, RouteHealth, Trip, Notification, NotificationType } from '../types';

export const SCHOOLS: School[] = [
  { id: 'S1', name: 'International Academy' },
  { id: 'S2', name: 'City High School' },
  { id: 'S3', name: 'Valley Elementary' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'U1',
    name: 'Sarah Super',
    email: 'sarah@platform.com',
    role: UserRole.SUPER_ADMIN,
    avatarUrl: 'https://picsum.photos/100/100',
  },
  {
    id: 'U2',
    name: 'Alex Ops',
    email: 'alex@transport.com',
    role: UserRole.ADMIN,
    avatarUrl: 'https://picsum.photos/101/101',
  },
  {
    id: 'U3',
    name: 'Principal Skinner',
    email: 'skinner@cityhigh.com',
    role: UserRole.SCHOOL_ADMIN,
    schoolId: 'S2',
    avatarUrl: 'https://picsum.photos/102/102',
  },
];

export const MOCK_ROUTES: TransportRoute[] = [
  { id: 'R1', name: 'Route A - North', schoolId: 'S1', type: 'PICKUP', status: 'ACTIVE', health: RouteHealth.NORMAL, driverId: 'D1', vehiclePlate: 'BUS-101' },
  { id: 'R2', name: 'Route B - East', schoolId: 'S1', type: 'PICKUP', status: 'ACTIVE', health: RouteHealth.DELAYED, driverId: 'D2', vehiclePlate: 'BUS-102' },
  { id: 'R3', name: 'Route C - South', schoolId: 'S2', type: 'DROPOFF', status: 'ACTIVE', health: RouteHealth.ALERT, driverId: 'D3', vehiclePlate: 'BUS-205' },
  { id: 'R4', name: 'Route D - West', schoolId: 'S2', type: 'PICKUP', status: 'INACTIVE', health: RouteHealth.NORMAL, driverId: 'D4', vehiclePlate: 'BUS-206' },
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'T1',
    routeId: 'R1',
    driverName: 'John Doe',
    date: '2023-10-27',
    startTime: '06:40',
    status: 'STARTED',
    riderCount: 15,
    events: [
      { time: '06:40', description: 'Trip Started', type: 'START' },
      { time: '06:52', description: 'Child boarded (John)', type: 'BOARDING', studentName: 'John' },
      { time: '07:05', description: 'Child boarded (Jane)', type: 'BOARDING', studentName: 'Jane' },
    ]
  },
  {
    id: 'T2',
    routeId: 'R3',
    driverName: 'Mike Smith',
    date: '2023-10-27',
    startTime: '07:00',
    status: 'STARTED',
    riderCount: 8,
    events: [
      { time: '07:00', description: 'Trip Started', type: 'START' },
      { time: '07:10', description: 'Speed alert (85km/h in 60 zone)', type: 'ALERT' },
      { time: '07:15', description: 'Unexpected Stop', type: 'ALERT' },
    ]
  },
  {
    id: 'T3',
    routeId: 'R4',
    driverName: 'Sarah Conner',
    date: '2023-10-26',
    startTime: '15:00',
    endTime: '16:15',
    status: 'ENDED',
    riderCount: 22,
    events: [
      { time: '15:00', description: 'Trip Started', type: 'START' },
      { time: '16:15', description: 'School Arrival', type: 'END' },
    ]
  }
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'N1', title: 'Speed Alert', message: 'Bus 205 exceeded speed limit on Route C.', type: NotificationType.SAFETY, timestamp: '10 min ago', read: false },
  { id: 'N2', title: 'Route Delayed', message: 'Route B is delayed by 15 mins due to traffic.', type: NotificationType.DELAY, timestamp: '1 hour ago', read: false },
  { id: 'N3', title: 'System Maintenance', message: 'Scheduled maintenance tonight at 2 AM.', type: NotificationType.SYSTEM, timestamp: '2 hours ago', read: true },
  { id: 'N4', title: 'Attendance Marked', message: 'Morning attendance completed for City High.', type: NotificationType.ATTENDANCE, timestamp: '3 hours ago', read: true },
];

// Drivers mock data (moved from DriversPage.tsx)
export const MOCK_DRIVERS = [
  { id: 'D1', name: 'James Wilson', vehicle: 'Toyota Coaster (BUS-101)', phone: '+1 234 567 890', email: 'james.w@transport.com', license: 'EXP-2025', status: 'ON_TRIP', avatar: 'https://picsum.photos/150', corporate: 'TechCorp Inc.' },
  { id: 'D2', name: 'Robert Chen', vehicle: 'Mercedes Sprinter (BUS-102)', phone: '+1 234 567 891', email: 'robert.c@transport.com', license: 'EXP-2024', status: 'AVAILABLE', avatar: 'https://picsum.photos/151', corporate: 'City Schools' },
  { id: 'D3', name: 'Sarah Miller', vehicle: 'Ford Transit (BUS-205)', phone: '+1 234 567 892', email: 'sarah.m@transport.com', license: 'EXP-2026', status: 'OFF_DUTY', avatar: 'https://picsum.photos/152', corporate: 'Global Logistics' },
  { id: 'D4', name: 'David Kim', vehicle: 'Unassigned', phone: '+1 234 567 893', email: 'david.k@transport.com', license: 'PENDING', status: 'PENDING', avatar: 'https://picsum.photos/153', corporate: 'Unassigned' },
];

// Students mock data (moved from StudentsPage.tsx)
export const MOCK_STUDENTS = [
  { id: 'ST1', name: 'Alice Johnson', school: 'International Academy', grade: '5th Grade', guardian: 'Martha Johnson', status: 'ON_BOARD' },
  { id: 'ST2', name: 'Bob Smith', school: 'City High School', grade: '10th Grade', guardian: 'John Smith', status: 'DROPPED_OFF' },
  { id: 'ST3', name: 'Charlie Brown', school: 'Valley Elementary', grade: '2nd Grade', guardian: 'Snoopy Brown', status: 'ABSENT' },
  { id: 'ST4', name: 'Daisy Ridley', school: 'International Academy', grade: '5th Grade', guardian: 'Mark Ridley', status: 'WAITING' },
  { id: 'ST5', name: 'Ethan Hunt', school: 'City High School', grade: '12th Grade', guardian: 'Tom Hunt', status: 'DROPPED_OFF' },
];

// Live drivers for dashboard (moved from Dashboard.tsx)
export const MOCK_LIVE_DRIVERS = [
  { id: 'D1', name: 'James Wilson', status: 'ON_TRIP', vehicle: 'BUS-101', avatar: 'https://picsum.photos/150' },
  { id: 'D2', name: 'Robert Chen', status: 'ONLINE', vehicle: 'BUS-102', avatar: 'https://picsum.photos/151' },
  { id: 'D3', name: 'Sarah Miller', status: 'OFFLINE', vehicle: '-', avatar: 'https://picsum.photos/152' },
  { id: 'D4', name: 'David Kim', status: 'ONLINE', vehicle: 'BUS-206', avatar: 'https://picsum.photos/153' },
  { id: 'D5', name: 'Lisa Ray', status: 'ON_TRIP', vehicle: 'BUS-207', avatar: 'https://picsum.photos/154' },
];
