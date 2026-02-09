# BusBuddy Transport Dashboard - Product Specification

## 1. Navigation

### a. Top Navigation Bar

**Elements:**
- **Logo** (clickable → Dashboard)
- **School Selector** (global, persists across pages)
  - Visibility based on user role:
    - **Super Admin:** All Schools + individual schools
    - **Admin:** Multiple schools dropdown
    - **School Admin:** Only their school (no dropdown)
- **Notifications Bell**
  - Badge count indicator
  - Click → dropdown with last 5 notifications
  - "View All" link → Notifications page
- **Profile Dropdown**
  - Profile
  - Settings
  - Logout

### b. Sidebar Navigation

**Visibility by Role:**
- **Super Admin:** Sees all menu items
- **Admin:** No "Roles & Permissions" tab in Settings page
- **School Admin:** 
  - No Schools page
  - School-specific settings only
  - Only see school-specific information

---

## 2. Dashboard

**Key Metrics:**
- Current Month Trips
- Current Month Kilometers
- Active Trips

**Features:**
- Drivers List
- Search with filters: (All, Online, On Trip)
- Map with live routes

---

## 3. Shuttle

### Tab: Routes (DO NOT CHANGE THIS TAB)
- All Routes view
- Table with columns:
  - Route ID
  - Route Name
  - School Name
  - Route Time
  - Route Type
  - Active/Inactive toggle
  - Action buttons
- **Filters:**
  - Filter by School
  - Filter by Type (Pickup/Drop-Off)
  - Search
- **Actions:**
  - Download report
  - Create route button

### Tab: Stops
**Layout:** Two-column

**Left Column:**
- School Search dropdown
- Table for selected school's stops
  - Columns:
    - Stop Number
    - Stop Name
    - Actions: [Locate, Enable/Disable toggle]

---

## 4. Trips

**Filters:**
- School Search dropdown
- Date Filter
- Export button

**Trips Table Columns:**
- Trip ID
- Driver
- Car
- Type (Shuttle)
- Date
- Start Time
- End Time
- Duration
- Distance
- Riders
- Status (Started/Ended)

**Action Button:** View

**Timeline View (on View click):**
```
06:40 Started
06:52 Child boarded (John)
07:10 Speed alert
07:32 School arrival
```

---

## 5. Shifts

**Filters:**
- School Search dropdown
- Date Filter
- Export button

**Table Columns:**
- Shift ID
- Drivers
- Scheduled Time
- Actual Time
- Shift Code
- Assigned Route
- Status
- Notes

**Add Shift Button → Modal:**
- School Search dropdown
- Shift Name
- Days
- Times
- Drivers Multi-select Search dropdown

**Action Buttons:**
- Edit Shift
- Clone Shift

---

## 6. Assignments

**Filters:**
- Date selector
- School Search dropdown
- Date Filter
- Export button

**Add Booking Button → Modal:**
- School Search dropdown
- Route Search dropdown
- Driver Search dropdown
- Date Select
- Recurring option
- **Features:**
  - Conflict detection (driver already booked)
  - Auto-suggest based on past assignments

**Table Columns:**
- Route ID
- Route Name
- School Name
- Route Time
- Route Type
- Date

**Filters:**
- Filter by School
- Filter by Type (Pickup/Drop-Off)
- Filter by Date
- Search
- Download report
- Create Assignment button

---

## 7. Drivers

**Filters:**
- School Search dropdown
- Driver Search dropdown

**Action Buttons:**
- Register Driver button
- Add Driver button

**Table Columns:**
- Photo
- Driver Name
- Vehicle Details (Make & Plate)
- Vehicle Category
- Status
- QR Code
- Corporate(s)

**Action Buttons:**
- View
- Add to Shift
- Change Vehicle
- Add/Change Corporate

---

## 8. Schools (DO NOT CHANGE TABS)

### Tab a: Overview
**Filters:**
- School Search dropdown

**Table Columns:**
- School
- Country
- Address
- Contract Date
- Managers (Account, Sales, Admin)

**Action Buttons:**
- Settings
- Pricing Structure
- Tasks
- Create Admin

### Tab b: Contracts & Pricing
**(Super Admin only)**

### Tab c: Designations
- Account Manager
- Sales
- Admin

### Tab d: Tasks / Issues

---

## 9. Students

**Filters:**
- School Search dropdown
- Student Search

**Action Buttons:**
- Add Student
- Bulk Upload

**Table Columns:**
- Name
- School
- Pickup Address
- Drop Address
- Parent/Guardian
- Status

**Action Buttons:**
- Edit Details
- View Trips
- Transfer
- Disable

---

## 10. Settings

### Tab: General Settings

### Tab: Roles & Permissions
