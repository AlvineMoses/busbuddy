/**
 * Backend DTO Type Definitions
 * All DTOs extend BaseApiDto with required fields for every API request
 */

// ============================================================================
// Base DTO (Required for all domain API requests)
// ============================================================================

export interface BaseApiDto {
  ApiActionTypeID: number;        // 1=Insert, 2=Update, 3=Delete, 4=Get
  ApiDynamicFields: string;        // JSON string for dynamic data
  ApiOperatorID: string;           // User's EmailID performing the action
  ApiRequestID: string;            // Unique request identifier (UUID)
  ApiRoleID: string;               // User's role ID
  ApiUniqueID: string;             // Session/user unique ID
  ApiOperatedOn: string;           // ISO timestamp
}

// ============================================================================
// Authentication DTOs
// ============================================================================

export interface AuthenticationDto extends BaseApiDto {
  EmailID: string;
  Password: string;
}

export interface OTPAuthenticationDto extends BaseApiDto {
  EmailTo: string;
  EmailBody: string;
  EmailFrom: string;
  EmailSubject: string;
  OTP: string;
  EmailCC?: string;
  EmailBCC?: string;
  EmailID: string;
  EventID: string;
}

export interface OTPVerificationDto extends BaseApiDto {
  EmailID: string;
  OtpNumber: string;
  IsOtpVerified: boolean;
  NewPassword: string;
  ConfirmPassword: string;
}

export interface SetNewPasswordDto extends BaseApiDto {
  EmailID: string;
  NewPassword: string;
  ConfirmPassword: string;
}

export interface ChangePasswordDto extends BaseApiDto {
  AdminImage?: string;
  OldPassword: string;
  EmailID: string;
  NewPassword: string;
  ConfirmPassword: string;
  IsVerified: boolean;
}

// ============================================================================
// Corporate DTOs (Maps to School in frontend)
// ============================================================================

export interface CorporateRegistrationDto extends BaseApiDto {
  EmailID: string;
  AccountManagerID?: string;
  AdminEmail: string;
  AdminName: string;
  ContractEnddate?: string;
  Contractstartdate?: string;
  Corporatedomain?: string;
  Corporatename: string;
  CountryID?: string;
  CreditPeriod?: string;
  Industry?: string;
  InvoiceContactEmail?: string;
  InvoiceContactName?: string;
  SalesExecutives?: string;
  AdminContactNo?: string;
  CorporateType?: string;
  CorporateLatlong?: string;
  AdminImage?: string;
  CorporateLogo?: string;
  Password?: string;
  EnabledModule?: string;
  RoleID?: string;
}

export interface CorporateListDto extends BaseApiDto {
  EmailID: string;
}

export interface GetCorporateListDto extends BaseApiDto {
  EmailID: string;
  RoleID: string;
  CorporateID?: string;
}

export interface CorporateAllActionlistDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
}

export interface AddEditCorporateServiceDto extends BaseApiDto {
  EmailID: string;
  AdminEmailID: string;
  AvailableServices?: string;
  CorporateID: string;
  IsMakerCheker?: boolean;
  Isservices?: boolean;
  IsVehiclecategory?: boolean;
  MakerCheker?: string;
  AllowedVehicleType?: string;
}

export interface SuspendCorporateDto extends BaseApiDto {
  CorporateID: string;
  EmailID: string;
}

export interface StaffListByCorporateDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  RouteType?: string;
}

export interface GetAllDepartmentByCorporateDto extends BaseApiDto {
  EmailID: string;
}

export interface AddEditShuttleStopDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  IsActive?: boolean;
  StopLatlong: string;
  StopName: string;
  ShuttlestopID?: string;
}

export interface GetShuttleStopsDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
}

// ============================================================================
// Department DTOs
// ============================================================================

export interface AddEditDepartmentDto extends BaseApiDto {
  EmailID: string;
  AdminEmail: string;
  AdminName: string;
  ButtonMark?: string;
  DepartmentID?: string;
  Departmentname: string;
  ParentID?: string;
  InterCountryTrips?: boolean;
  LockVehicleType?: string;
  AllowedVehicleType?: string;
  AvailableServices?: string;
}

export interface DepartmentApprovalDto extends BaseApiDto {
  CorporateID: string;
  IsApproved: boolean;
  EmailID: string;
}

export interface GetDepartmentListDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
}

export interface GetDepartmentDetailsDto extends BaseApiDto {
  EmailID: string;
  DepartmentID: string;
}

// ============================================================================
// Staff DTOs (Maps to Students/Riders in frontend)
// ============================================================================

export interface AddEditStaffDto extends BaseApiDto {
  EmailID: string;
  Address?: string;
  ClassStandards?: string;
  CorporateID: string;
  CorporateName?: string;
  CorporateType?: string;
  ParentEmailAddress?: string;
  ParentFirstName?: string;
  ParentLastName?: string;
  ParentsMobileNumber?: string;
  PickupLL?: string;
  DropLL?: string;
  StaffFirstName: string;
  StaffImage?: string;
  StaffLastName: string;
  StaffMobileNumber: string;
  Pincode?: string;
  State?: string;
  City?: string;
  Area?: string;
  PickupStop?: string;
  DropStop?: string;
}

export interface GetStaffDetailsDto extends BaseApiDto {
  EmailID: string;
  MobileNumber: string;
  CorporateType?: string;
}

export interface GetStaffListDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
}

export interface SuspendStaffDto extends BaseApiDto {
  MobileNumber: string;
  EmailID: string;
}

export interface TransferStaffDto extends BaseApiDto {
  MobileNumber: string;
  DepartmentID: string;
  EmailID: string;
}

// ============================================================================
// Route DTOs
// ============================================================================

export interface AddEditRouteCreationDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  RouteID?: string;
  RouteName: string;
  RouteType: string;
  ShuttleTypeID?: string;
  ShuttleTiming?: string;
  ShuttleRoute?: string;
  StaffList?: string;
}

export interface GetRouteListDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  DepartmentID?: string;
}

export interface GetRouteDetailsDto extends BaseApiDto {
  EmailID: string;
  RouteID: string;
}

export interface GetBookRouteDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  EndDate?: string;
  FromDate?: string;
  RoleID: string;
}

export interface EnableDisableShuttleRouteDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  RouteID: string;
  IsDeactivated: boolean;
}

// ============================================================================
// Driver DTOs
// ============================================================================

export interface GetDriverListDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  RoleID: string;
}

export interface GetDriverList_V2Dto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  RoleID: string;
  IsRider?: boolean;
  IsDriver?: boolean;
}

export interface GetDriverDetailsDto extends BaseApiDto {
  EmailID: string;
  DriverEmailID: string;
}

export interface AddEditPrivateDriverDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  DriverEmailID: string;
  RoleID: string;
  IsAdd: boolean;
  DepartmentID?: string;
}

export interface EditAssignedDriverDto extends BaseApiDto {
  EmailID: string;
  Amount?: number;
  RoleID: string;
  DriverEmailID: string;
  Status: string;
  BookingID: string;
  SendSms?: boolean;
  DriverCost?: number;
  CompanyCost?: number;
}

// ============================================================================
// Trip DTOs
// ============================================================================

export interface GetAllTripsDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  FromDate?: string;
  ToDate?: string;
  RoleID: string;
  StaffMobileNumber?: string;
  DepartmentID?: string;
}

export interface AllTripsDetailsDto extends BaseApiDto {
  EmailID: string;
  JourneyID: string;
  TripType: string;
}

export interface GetTripDetailsDto extends BaseApiDto {
  CorporateID: string;
  EmailID: string;
  LocationCount?: number;
  RoleID: string;
  TripID: string;
}

export interface ShuttleTripsDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  DepartmentID?: string;
  StaffMobileNumber?: string;
  FromDate?: string;
  ToDate?: string;
}

export interface ShuttleTripsDetailsDto extends BaseApiDto {
  EmailID: string;
  JourneyID: string;
}

export interface GetPrivateTripDto extends BaseApiDto {
  EmailID: string;
  UserType?: string;
  FromDate?: string;
  ToDate?: string;
}

export interface GetPrivateTripDetailsDto extends BaseApiDto {
  EmailID: string;
  JourneyID: string;
}

export interface LiveTripDetailsDto extends BaseApiDto {
  EmailID: string;
  DriverEmailID?: string;
  CorporateID: string;
  IsAll?: boolean;
}

// ============================================================================
// Shuttle Booking DTOs
// ============================================================================

export interface GetShuttlebookingDetailsDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
}

export interface EditRouteBookingDto extends BaseApiDto {
  EmailID: string;
  Editbookings: string; // JSON
}

export interface CancelledRouteBookingDto extends BaseApiDto {
  EmailID: string;
  Cancelledbookings: string; // JSON
  RiderTripID: string;
}

export interface GetBookedRiderDetailsDto extends BaseApiDto {
  EmailID: string;
  LineID: string;
  RouteID: string;
}

// ============================================================================
// Schedule Booking DTOs
// ============================================================================

export interface AddEditRequestBookingDto extends BaseApiDto {
  Amount?: number;
  BookingDateTime?: string;
  BookingID?: string;
  BookingType?: string;
  City?: string;
  CorporateID: string;
  Country?: string;
  Currency?: string;
  DropoffAddress?: string;
  DropOffDateTime?: string;
  DropoffLatitude?: string;
  DropoffLongitude?: string;
  GuestMobileNumber?: string;
  GuestName?: string;
  LocalAmount?: number;
  MobileNumber?: string;
  OTPTollChargeTrip?: boolean;
  OTPOnEndTrip?: boolean;
  OTPOnParkingTrip?: boolean;
  OTPOnStartTrip?: boolean;
  PickupAddress?: string;
  PickupDateTime?: string;
  PickupLatitude?: string;
  PickupLongitude?: string;
  RouteJSON?: string;
  VehicleType?: string;
  WalletUniqueID?: string;
  EmailID: string;
  Justification?: string;
  SendSms?: boolean;
  SendEMail?: boolean;
}

export interface GetRequestBookingDetailsDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  RoleID: string;
  StartDate?: string;
  EndDate?: string;
}

export interface CancelScheduleTripDto extends BaseApiDto {
  EmailID: string;
  Status: string;
  CancelNotes?: string;
  BookingID: string;
}

export interface GetScheduleTripDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  FromDate?: string;
  ToDate?: string;
  RoleID: string;
}

export interface ScheduleTripsDetailsDto extends BaseApiDto {
  EmailID: string;
  JourneyID: string;
}

// ============================================================================
// Dashboard DTOs
// ============================================================================

export interface GetDashboardDto extends BaseApiDto {
  EmailID: string;
}

// ============================================================================
// Menu DTOs
// ============================================================================

export interface MenuListDto extends BaseApiDto {
  EmailID: string;
}

export interface GetUserMenuListDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
}

export interface AddEditMenulistByRoleDto extends BaseApiDto {
  EmailID: string;
  RoleID: string;
  CorporateID: string;
  ModuleIDs: string;
}

export interface GetMenulistByRoleDto extends BaseApiDto {
  EmailID: string;
  RoleID: string;
  CorporateID: string;
}

// ============================================================================
// Header/Notification DTOs
// ============================================================================

export interface GetNotificationDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
}

export interface GetHeaderInfoDto extends BaseApiDto {
  EmailID: string;
  CorporateID: string;
  RoleID: string;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// API Action Type IDs
export enum ApiActionType {
  Insert = 1,
  Update = 2,
  Delete = 3,
  Get = 4,
  List = 5
}

// Helper function to create BaseApiDto with required fields
export function createBaseDto(
  emailId: string,
  roleId: string,
  uniqueId: string,
  actionTypeId: number = ApiActionType.Get
): BaseApiDto {
  return {
    ApiActionTypeID: actionTypeId,
    ApiDynamicFields: '',
    ApiOperatorID: emailId,
    ApiRequestID: generateRequestId(),
    ApiRoleID: roleId,
    ApiUniqueID: uniqueId,
    ApiOperatedOn: new Date().toISOString()
  };
}

// Helper to convert DTO to plain object for ApiClient
export function dtoToPayload<T extends BaseApiDto>(dto: T): Record<string, unknown> {
  return dto as unknown as Record<string, unknown>;
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
