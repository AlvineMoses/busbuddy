import { UserRole, User, School, TransportRoute, RouteHealth, Trip, Notification, NotificationType } from '../types';

export const SCHOOLS: School[] = [
  { id: 'S1', name: 'Brookhouse School' },
  { id: 'S2', name: 'Nairobi Academy' },
  { id: 'S3', name: 'Riara Springs Academy' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'U1',
    name: 'Amina Odhiambo',
    email: 'amina@busbudd.co.ke',
    role: UserRole.SUPER_ADMIN,
    avatarUrl: 'https://picsum.photos/100/100',
  },
  {
    id: 'U2',
    name: 'Kevin Mwangi',
    email: 'kevin@busbudd.co.ke',
    role: UserRole.ADMIN,
    avatarUrl: 'https://picsum.photos/101/101',
  },
  {
    id: 'U3',
    name: 'Principal Njeri',
    email: 'njeri@nairobiacademy.ac.ke',
    role: UserRole.SCHOOL_ADMIN,
    schoolId: 'S2',
    avatarUrl: 'https://picsum.photos/102/102',
  },
];

export const MOCK_ROUTES: TransportRoute[] = [
  { id: 'R1', name: 'Westlands - Karen', schoolId: 'S1', type: 'PICKUP', status: 'ACTIVE', health: RouteHealth.NORMAL, driverId: 'D1', vehiclePlate: 'KAA 101B' },
  { id: 'R2', name: 'Lavington - Kilimani', schoolId: 'S1', type: 'PICKUP', status: 'ACTIVE', health: RouteHealth.DELAYED, driverId: 'D2', vehiclePlate: 'KBB 202C' },
  { id: 'R3', name: 'Langata - South B', schoolId: 'S2', type: 'DROPOFF', status: 'ACTIVE', health: RouteHealth.ALERT, driverId: 'D3', vehiclePlate: 'KCC 305D' },
  { id: 'R4', name: 'Kileleshwa - Hurlingham', schoolId: 'S2', type: 'PICKUP', status: 'INACTIVE', health: RouteHealth.NORMAL, driverId: 'D4', vehiclePlate: 'KDD 406E' },
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'T1',
    routeId: 'R1',
    driverName: 'Joseph Kamau',
    date: '2024-11-18',
    startTime: '06:40',
    status: 'STARTED',
    riderCount: 15,
    events: [
      { time: '06:40', description: 'Trip Started', type: 'START' },
      { time: '06:52', description: 'Child boarded (Wanjiku)', type: 'BOARDING', studentName: 'Wanjiku' },
      { time: '07:05', description: 'Child boarded (Ochieng)', type: 'BOARDING', studentName: 'Ochieng' },
    ]
  },
  {
    id: 'T2',
    routeId: 'R3',
    driverName: 'Peter Otieno',
    date: '2024-11-18',
    startTime: '07:00',
    status: 'STARTED',
    riderCount: 8,
    events: [
      { time: '07:00', description: 'Trip Started', type: 'START' },
      { time: '07:10', description: 'Speed alert (85km/h in 50 zone)', type: 'ALERT' },
      { time: '07:15', description: 'Unexpected Stop on Langata Road', type: 'ALERT' },
    ]
  },
  {
    id: 'T3',
    routeId: 'R4',
    driverName: 'Grace Wambui',
    date: '2024-11-17',
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
  { id: 'N1', title: 'Speed Alert', message: 'KCC 305D exceeded speed limit on Langata Road.', type: NotificationType.SAFETY, timestamp: '10 min ago', read: false },
  { id: 'N2', title: 'Route Delayed', message: 'Lavington route delayed 15 mins due to Uhuru Highway traffic.', type: NotificationType.DELAY, timestamp: '1 hour ago', read: false },
  { id: 'N3', title: 'System Maintenance', message: 'Scheduled maintenance tonight at 2 AM EAT.', type: NotificationType.SYSTEM, timestamp: '2 hours ago', read: true },
  { id: 'N4', title: 'Attendance Marked', message: 'Morning attendance completed for Nairobi Academy.', type: NotificationType.ATTENDANCE, timestamp: '3 hours ago', read: true },
];

// Drivers mock data
export const MOCK_DRIVERS = [
  { id: 'D1', name: 'Joseph Kamau', vehicle: 'Toyota Coaster (KAA 101B)', phone: '+254 712 345 678', email: 'kamau@busbudd.co.ke', license: 'EXP-2025', status: 'ON_TRIP', avatar: 'https://picsum.photos/150', corporate: 'Brookhouse School' },
  { id: 'D2', name: 'Peter Otieno', vehicle: 'Isuzu NQR (KBB 202C)', phone: '+254 723 456 789', email: 'otieno@busbudd.co.ke', license: 'EXP-2024', status: 'AVAILABLE', avatar: 'https://picsum.photos/151', corporate: 'Nairobi Academy' },
  { id: 'D3', name: 'Grace Wambui', vehicle: 'Toyota HiAce (KCC 305D)', phone: '+254 734 567 890', email: 'wambui@busbudd.co.ke', license: 'EXP-2026', status: 'OFF_DUTY', avatar: 'https://picsum.photos/152', corporate: 'Riara Springs Academy' },
  { id: 'D4', name: 'Samuel Kipchoge', vehicle: 'Unassigned', phone: '+254 745 678 901', email: 'kipchoge@busbudd.co.ke', license: 'PENDING', status: 'PENDING', avatar: 'https://picsum.photos/153', corporate: 'Unassigned' },
];

// Students mock data
export const MOCK_STUDENTS = [
  { id: 'ST1', name: 'Wanjiku Kamau', school: 'Brookhouse School', grade: '5th Grade', guardian: 'Mary Kamau', status: 'ON_BOARD' },
  { id: 'ST2', name: 'Ochieng Odhiambo', school: 'Nairobi Academy', grade: '10th Grade', guardian: 'James Odhiambo', status: 'DROPPED_OFF' },
  { id: 'ST3', name: 'Aisha Mohamed', school: 'Riara Springs Academy', grade: '2nd Grade', guardian: 'Fatma Mohamed', status: 'ABSENT' },
  { id: 'ST4', name: 'Brian Mwangi', school: 'Brookhouse School', grade: '5th Grade', guardian: 'Jane Mwangi', status: 'WAITING' },
  { id: 'ST5', name: 'Lilian Njeri', school: 'Nairobi Academy', grade: '12th Grade', guardian: 'David Njeri', status: 'DROPPED_OFF' },
];

// Live drivers for dashboard
export const MOCK_LIVE_DRIVERS = [
  { id: 'D1', name: 'Joseph Kamau', status: 'ON_TRIP', vehicle: 'KAA 101B', avatar: 'https://picsum.photos/150' },
  { id: 'D2', name: 'Peter Otieno', status: 'ONLINE', vehicle: 'KBB 202C', avatar: 'https://picsum.photos/151' },
  { id: 'D3', name: 'Grace Wambui', status: 'OFFLINE', vehicle: '-', avatar: 'https://picsum.photos/152' },
  { id: 'D4', name: 'Samuel Kipchoge', status: 'ONLINE', vehicle: 'KDD 406E', avatar: 'https://picsum.photos/153' },
  { id: 'D5', name: 'Faith Akinyi', status: 'ON_TRIP', vehicle: 'KEE 507F', avatar: 'https://picsum.photos/154' },
];
