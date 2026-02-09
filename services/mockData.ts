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
