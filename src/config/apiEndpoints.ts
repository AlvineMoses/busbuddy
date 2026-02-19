/**
 * API Endpoints Configuration - Backend Integration
 * ================================
 * 
 * Backend API Structure: api/v1/{Controller}/{Action}
 * All domain endpoints use POST method (except /health endpoints which use GET)
 * Authentication: JWT Bearer token required (except [AllowAnonymous] endpoints)
 * 
 * Principles:
 * 1. All endpoints match backend route structure exactly
 * 2. Centralized endpoint definitions — single source of truth
 * 3. Controller-centric grouping matching backend controllers
 * 4. Zero string duplication — import from here, never hardcode paths
 */

// ============================================
// AUTHENTICATION ENDPOINTS (AllowAnonymous)
// ============================================
export const AUTH = {
  AUTHENTICATE_USER:      '/v1/Authentication/AuthenticateUser',
  AUTHENTICATE_OTP:       '/v1/Authentication/AuthenticateOTP',
  OTP_VERIFICATION:       '/v1/Authentication/OTPVerification',
  SET_NEW_PASSWORD:       '/v1/Authentication/SetNewPassword',
} as const;

// ============================================
// CORPORATE ENDPOINTS (Maps to School/Organization)
// ============================================
export const CORPORATE = {
  REGISTRATION:           '/v1/Corporate/CorporateRegistration',
  LIST:                   '/v1/Corporate/CorporateList',
  ALL_ACTION_LIST:        '/v1/Corporate/CorporateAllActionList',
  ADD_EDIT_SERVICE:       '/v1/Corporate/AddEditCorporateService',
  SUSPEND:                '/v1/Corporate/SuspendCorporate',
  STAFF_LIST:             '/v1/Corporate/StaffListByCorporate',
  GET_ALL_DEPARTMENTS:    '/v1/Corporate/GetAllDepartmentByCorporate',
  ADD_REGISTRATION_V2:    '/v1/Corporate/AddCorporateRegV2',
  ADD_EDIT_SHUTTLE_STOP:  '/v1/Corporate/AddEditShuttleStop',
  GET_SHUTTLE_STOP:       '/v1/Corporate/GetShuttleStop',
  GET_CORPORATES:         '/v1/Corporate/GetCorporates',
  ADD_EDIT_PARAMETER:     '/v1/Corporate/AddEditCorporateParameter',
} as const;

// ============================================
// DEPARTMENT ENDPOINTS
// ============================================
export const DEPARTMENT = {
  ADD_EDIT:               '/v1/Department/AddEditDepartment',
  APPROVAL:               '/v1/Department/DepartmentApproval',
  LIST:                   '/v1/Department/DepartmentList',
  GET_DETAILS:            '/v1/Department/GetDepartmentDetails',
} as const;

// ============================================
// STAFF ENDPOINTS (Maps to Students/Riders)
// ============================================
export const STAFF = {
  ADD_EDIT:               '/v1/Staff/AddEditStaff',
  GET_DETAILS:            '/v1/Staff/GetStaffDetails',
  GET_LIST:               '/v1/Staff/GetStaffList',
  SUSPEND:                '/v1/Staff/SuspendStaff',
  TRANSFER:               '/v1/Staff/TransferStaff',
  GET_LITTLE_DETAILS:     '/v1/Staff/GetLittleStaffDetails',
  ADD_EDIT_LITTLE:        '/v1/Staff/AddEditLittleStaffDetails',
  ADD_EDIT_V2:            '/v1/Staff/AddEditStafV2',
} as const;

// ============================================
// ROUTE ENDPOINTS
// ============================================
export const ROUTE = {
  ADD_EDIT:               '/v1/Route/AddEditRoute',
  GET_LIST:               '/v1/Route/GetRoutList',
  GET_DETAILS:            '/v1/Route/GetRouteDetails',
  GET_BOOKED:             '/v1/Route/GetBookedRoute',
  ENABLE_DISABLE:         '/v1/Route/EnableDisableShuttleRoute',
} as const;

// ============================================
// DRIVER ENDPOINTS
// ============================================
export const DRIVER = {
  GET_PRIVATE_LIST:       '/v1/DriverList/GetPrivateDriverList',
  GET_LIST:               '/v1/DriverList/GetDriverList',
  ONLINE_LOCATIONS:       '/v1/DriverList/DriveronlineLocations',
  EDIT_ASSIGNED:          '/v1/DriverList/EditAssignedDriver',
  ADD_EDIT_PRIVATE:       '/v1/DriverList/AddEditPrivateDriver',
  LIST_V2:                '/v1/DriverList/DriverListV2',
  GET_DETAILS:            '/v1/DriverList/GetDriverDetails',
  UPDATE_OVERTIME:        '/v1/DriverList/UpdatetDriverOvertime',
  GET_PARTNERS_VEHICLES:  '/v1/DriverList/GetPartnersWithVehicles',
  ASSIGN_VEHICLE:         '/v1/DriverList/GetAssignVehicleToDriver',
} as const;

// ============================================
// DRIVER SHIFT ENDPOINTS
// ============================================
export const DRIVER_SHIFT = {
  ADD_EDIT:               '/v1/DriverShift/AddEditDriverShift',
  GET_DETAILS:            '/v1/DriverShift/GetDriverShiftDetails',
  DETAILS_REPORT:         '/v1/DriverShift/DriverShiftDetailsReport',
} as const;

// ============================================
// TRIP ENDPOINTS
// ============================================
export const TRIPS = {
  GET_ALL:                '/v1/Trips/GetAllTrips',
  ALL_DETAILS:            '/v1/Trips/AllTripsDetails',
  GET_DETAILS:            '/v1/Trips/GetTripDetails',
} as const;

// ============================================
// LIVE TRIP ENDPOINTS
// ============================================
export const LIVE_TRIP = {
  GET_DETAILS:            '/v1/LiveTrip/GetLiveTripDetails',
} as const;

// ============================================
// SHUTTLE TRIP ENDPOINTS
// ============================================
export const SHUTTLE_TRIPS = {
  GET_TRIPS:              '/v1/ShuttleTrips/GetShuttleTrips',
  DETAILS:                '/v1/ShuttleTrips/ShuttleTripsDetails',
  ADD_EDIT_DRIVER_RIDER:  '/v1/ShuttleTrips/AddEditDriverwithRiderAssing',
  ADD_EDIT_DRIVER:        '/v1/ShuttleTrips/AddEditShuttleDriver',
  GET_DRIVER_LIST:        '/v1/ShuttleTrips/GetShuttleDriverList',
  GET_ALL_DRIVER_RIDER:   '/v1/ShuttleTrips/GetAllDriverWithRiderList',
} as const;

// ============================================
// PRIVATE TRIP ENDPOINTS
// ============================================
export const PRIVATE_TRIP = {
  GET:                    '/v1/PrivateTrip/GetPrivateTrip',
  DETAILS:                '/v1/PrivateTrip/PrivateTripDetails',
} as const;

// ============================================
// SHUTTLE BOOKING ENDPOINTS
// ============================================
export const SHUTTLE_BOOKING = {
  GET_DETAILS:            '/v1/ShuttleBooking/GetShuttlebookingDetails',
  EDIT:                   '/v1/ShuttleBooking/EditRouteBooking',
  CANCEL:                 '/v1/ShuttleBooking/CancelledRouteBooking',
  GET_BOOKED_RIDER:       '/v1/ShuttleBooking/GetBookedRiderDetails',
} as const;

// ============================================
// SCHEDULE BOOKING ENDPOINTS
// ============================================
export const SCHEDULE_BOOKING = {
  ADD_EDIT_REQUEST:       '/v1/ScheduleBooking/AddEditBookingRequest',
  GET_REQUEST_DETAILS:    '/v1/ScheduleBooking/GetBookingRequestDetails',
  CANCEL:                 '/v1/ScheduleBooking/CancelScheduleTrip',
  GET_TRIP:               '/v1/ScheduleBooking/GetScheduleTrip',
  TRIP_DETAILS:           '/v1/ScheduleBooking/ScheduleTripsDetails',
  TRIP_REPORT:            '/v1/ScheduleBooking/ScheduleTripReport',
  REQUEST_DETAILS_REPORT: '/v1/ScheduleBooking/GetBookingRequestDetailsReport',
} as const;

// ============================================
// DASHBOARD ENDPOINTS
// ============================================
export const DASHBOARD = {
  GET:                    '/v1/Dashboard/GetDashboard',
} as const;

// ============================================
// MENU ENDPOINTS
// ============================================
export const MENU = {
  GET_LIST:               '/v1/Menu/GetMenuList',
  GET_USER_LIST:          '/v1/Menu/GetUserMenuList',
  LIST_2:                 '/v1/Menu/MenuList2',
  ADD_EDIT_BY_ROLE:       '/v1/Menu/AddEditMenulistByRole',
  GET_BY_ROLE:            '/v1/Menu/GetMenulistByRole',
} as const;

// ============================================
// HEADER ENDPOINTS
// ============================================
export const HEADER = {
  CHANGE_PASSWORD:        '/v1/Header/ChangePassword',
  GET_NOTIFICATION:       '/v1/Header/GetNotification',
  GET_INFO:               '/v1/Header/GetHeaderInfo',
} as const;

// ============================================
// DISPATCH ENDPOINTS
// ============================================
export const DISPATCH = {
  ADD_PRIVATE_TRIP:       '/v1/Dispatch/AddDispatchPrivateTrip',
} as const;

// ============================================
// REPORT ENDPOINTS
// ============================================
export const REPORT = {
  SHUTTLE_TRIP:           '/v1/Report/ShuttleTripReport',
} as const;

// ============================================
// HEALTH ENDPOINTS (GET method, no auth)
// ============================================
export const HEALTH = {
  HEALTH:                 '/health',
  DB:                     '/health/db',
} as const;

// ============================================
// AGGREGATE EXPORT
// ============================================
export const API = {
  AUTH,
  CORPORATE,
  DEPARTMENT,
  STAFF,
  ROUTE,
  DRIVER,
  DRIVER_SHIFT,
  TRIPS,
  LIVE_TRIP,
  SHUTTLE_TRIPS,
  PRIVATE_TRIP,
  SHUTTLE_BOOKING,
  SCHEDULE_BOOKING,
  DASHBOARD,
  MENU,
  HEADER,
  DISPATCH,
  REPORT,
  HEALTH,
} as const;

export default API;
