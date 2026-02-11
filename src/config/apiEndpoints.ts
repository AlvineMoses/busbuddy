/**
 * API Endpoints Configuration
 * ================================
 * 
 * SMART DATA-FLOW: Centralized endpoint definitions — single source of truth.
 * 
 * Principles:
 * 1. All endpoints defined WITHOUT /api prefix — ApiClient handles prefix addition automatically.
 * 2. Entity-centric grouping — one object per domain entity.
 * 3. RESTful naming conventions — verbs via HTTP methods, nouns via paths.
 * 4. Parameterized helpers — functions that produce dynamic paths (e.g. /drivers/:id).
 * 5. Zero string duplication — import from here, never hardcode paths in services.
 * 
 * When adding a new endpoint:
 *   1. Add it to the relevant entity group below.
 *   2. Use it in the corresponding service in UnifiedApiService.js.
 *   3. Add it to the Postman collection if needed.
 */

// ============================================
// AUTH ENDPOINTS
// ============================================
export const AUTH = {
  LOGIN:                  '/auth/login',
  LOGOUT:                 '/auth/logout',
  ME:                     '/auth/me',
  VERIFY_OTP:             '/auth/verify-otp',
  RESEND_OTP_LOGIN:       '/auth/resend-otp',
  FORGOT_PASSWORD:        '/auth/forgot-password',
  PREFERRED_OTP_CHANNEL:  '/auth/preferred_otp_channel',
  RESEND_OTP:             '/auth/resend-otp-forgot-password',
  RESET_PASSWORD:         '/auth/reset-password',
  REFRESH_TOKEN:          '/auth/refresh-token',
  USER_ACCOUNTS:          '/auth/user-accounts',
  VERIFY_ACCOUNT:         '/verify/account',
} as const;

// ============================================
// SCHOOL ENDPOINTS
// ============================================
export const SCHOOLS = {
  BASE:             '/schools',
  BY_ID:            (id: string) => `/schools/${id}`,
  STATS:            (id: string) => `/schools/${id}/stats`,
} as const;

// ============================================
// DRIVER ENDPOINTS
// ============================================
export const DRIVERS = {
  BASE:             '/drivers',
  BY_ID:            (id: string) => `/drivers/${id}`,
  GENERATE_OTP:     (id: string) => `/drivers/${id}/generate-otp`,
  QR_CODE:          (id: string) => `/drivers/${id}/qr-code`,
  STATUS:           (id: string) => `/drivers/${id}/status`,
  LIVE:             '/drivers/live',
} as const;

// ============================================
// ROUTE ENDPOINTS
// ============================================
export const ROUTES = {
  BASE:             '/routes',
  BY_ID:            (id: string) => `/routes/${id}`,
  TRIPS:            (id: string) => `/routes/${id}/trips`,
  EXPORT:           '/routes/export',
  LIVE:             '/routes/live',
} as const;

// ============================================
// TRIP ENDPOINTS
// ============================================
export const TRIPS = {
  BASE:             '/trips',
  BY_ID:            (id: string) => `/trips/${id}`,
  FLAG:             (id: string) => `/trips/${id}/flag`,
  PLAYBACK:         (id: string) => `/trips/${id}/playback`,
  EVENTS:           (id: string) => `/trips/${id}/events`,
  STATS:            '/trips/stats',
} as const;

// ============================================
// STUDENT ENDPOINTS
// ============================================
export const STUDENTS = {
  BASE:             '/students',
  BY_ID:            (id: string) => `/students/${id}`,
  DISABLE:          (id: string) => `/students/${id}/disable`,
  TRANSFER:         (id: string) => `/students/${id}/transfer`,
  BULK_UPLOAD:      '/students/bulk-upload',
} as const;

// ============================================
// ASSIGNMENT ENDPOINTS
// ============================================
export const ASSIGNMENTS = {
  BASE:             '/assignments',
  BY_ID:            (id: string) => `/assignments/${id}`,
  CONFLICTS:        '/assignments/conflicts',
} as const;

// ============================================
// SHIFT ENDPOINTS
// ============================================
export const SHIFTS = {
  BASE:             '/shifts',
  BY_ID:            (id: string) => `/shifts/${id}`,
  DUPLICATE:        (id: string) => `/shifts/${id}/duplicate`,
} as const;

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================
export const NOTIFICATIONS = {
  BASE:             '/notifications',
  BY_ID:            (id: string) => `/notifications/${id}`,
  READ:             (id: string) => `/notifications/${id}/read`,
  READ_ALL:         '/notifications/read-all',
  UNREAD_COUNT:     '/notifications/unread-count',
} as const;

// ============================================
// SETTINGS ENDPOINTS
// ============================================
export const SETTINGS = {
  BASE:             '/settings',
  UPLOAD_IMAGE:     '/settings/upload-image',
  PERMISSIONS:      '/settings/permissions',
} as const;

// ============================================
// DASHBOARD ENDPOINTS
// ============================================
export const DASHBOARD = {
  METRICS:          '/dashboard/metrics',
  LIVE_FEED:        '/dashboard/live-feed',
} as const;

// ============================================
// AGGREGATE EXPORT — Allows `import { API } from '@/src/config/apiEndpoints'`
// ============================================
export const API = {
  AUTH,
  SCHOOLS,
  DRIVERS,
  ROUTES,
  TRIPS,
  STUDENTS,
  ASSIGNMENTS,
  SHIFTS,
  NOTIFICATIONS,
  SETTINGS,
  DASHBOARD,
} as const;

export default API;
