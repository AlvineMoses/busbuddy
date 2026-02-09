# BusBuddy Transport Dashboard

1. Navigation   a. Top Nav
Elements:
* Logo (clickable → Dashboard)
* School Selector (global, persists across pages)
    * Shows based on role:
        * Super Admin: All Schools + individual schools
        * Admin: Multiple schools dropdown
        * School Admin: Only their school (no dropdown)
* Notifications Bell
    * Badge count
    * Click → dropdown with last 5 notifications
    * "View All" link → Notifications page
* Profile Dropdown
    * Profile
    * Settings
    * Logout  
	b. Sidebar:
* Super Admin: Sees all
* Admin: No Roles & Perissions tab in Settings page
* School Admin: No Schools page, School specific settings, Only see school-specific info


1. Dashboard  
* Metrics i.e. Current Month Trips , Current Month Kilometers, Active Trips  
* Drivers List 
* Search + (All, Online, On Trip) 
* Map with Routes  

1. Shuttle Two tabs i.e a. Routes  - All Routes - Table with columns (Route ID, Route Name, School Name, Route Time, Route Type, Active / Inactive toggle) and action buttons ,Filter by School, Filter by type(Pickup/Drop-Off), Search, Download report, Create route button.  b. Stops - Two column layout:  Left : School Search dropdown , Table for the selected corporate’s stops. columns (Stop Number, Stop Name, Actions[ Locate, Enable/Disable toggle]) 

2. Trips. - School Search dropdown, Date Filter, Export button  - Trips Table with columns (TripID, Driver, Car, Type(Shuttle), Date, Start time, Ended time, Duration, Distance, Riders, Status(Started/ended)) and action button View that shows a timeline Clicked button → timeline view
06:40 Started
06:52 Child boarded (John)
07:10 Speed alert
07:32 School arrival




5. Shifts 
* School Search dropdown, Date Filter, Export button 
* Table with columns (ShiftID, Drivers, Scheduled time, Actual time, Shift Code, Assigned Route, Status, Notes.  
* Add Shift Button, and modal with School Search dropdown, Shift Name, Days, Times , Drivers Multi-select Search dropdown.  Action button to :
a. Edit Shift.
b. Allow shift cloning


6. Assignments.
* Date   
* Add Booking Button, and modal with (School Search dropdown, Route Search dropdown, Driver Search dropdown, Date Select, Recurring option),  Conflict detection (driver already booked) , Auto-suggest based on past assignments
* School Search dropdown, Date Filter, Export button  
* Table with columns (Route ID, Route Name, School Name, Route Time, Route Type, Date), Filter by School, Filter by type(Pickup/Drop-Off), Filter by date, Search, Download report, Create Assignment button. 

7. Drivers 
* School Search dropdown  
* Driver Search dropdown 
* Register Driver button & Add driver button  
* Table with columns ( photo, driverName, Vehicle Details(Make & Plate), Vehicle Category, status , QR code, Corporate(s)) and action Buttons (View, Add to Shift, Change vehicle, Add/change Corporate)   


8. Schools 4 tabs i.e 	a. Overview:
* School Search dropdown 
* Table with columns ( School, Country, Address , Contract Date, Managers(Account, Sales, Admin), Action Buttons(Settings, Pricing Structure, Tasks, Create Admin).   b. Contracts & Pricing (Super Admin only) c. Designations - Account Manager - Sales,  - Admin d. Tasks / Issues

9. Students
* School Search dropdown
* Student Search 
* Add Student | Bulk Opload Buttons
* Table with columns (Name, School, Pickup address, Drop Address, Parent/Guardian, Status)
* Action buttons (Edit details, View Trips, Transfer , Disable)

10. Settings two tabs: General Settings | Role & Permissions.
