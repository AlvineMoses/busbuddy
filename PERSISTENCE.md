# Data Persistence Guide

## Overview
All entity data (schools, drivers, routes, trips, students, settings, notifications) is now persisted to **localStorage** for dynamic CRUD operations in development.

## How It Works

### Storage Layer
- **Location**: `src/services/UnifiedApiService.js`
- **Prefix**: All keys use `busbuddy_` prefix
- **Initialization**: On app load, localStorage is initialized with mock data if empty

### Persistent Entities
Each entity service now supports full CRUD with localStorage persistence:

| Entity | Storage Key | Operations |
|--------|------------|------------|
| Schools | `busbuddy_schools` | getAll, getById, create, update, delete |
| Drivers | `busbuddy_drivers` | getAll, getById, create, update, delete |
| Routes | `busbuddy_routes` | getAll, getById, create, update, delete |
| Trips | `busbuddy_trips` | getAll, getById, create, update, delete |
| Students | `busbuddy_students` | getAll, getById, create, update, delete, bulkUpload |
| Settings | `busbuddy_settings` | get, update |
| Notifications | `busbuddy_notifications` | getAll, markAsRead, markAllAsRead, delete |

## Usage Examples

### Creating a New Driver
```javascript
const newDriver = await driverService.create({
  name: 'John Doe',
  license: 'DL123456',
  phone: '+1234567890'
});
// Persisted to localStorage immediately
// Will survive page reloads
```

### Updating Settings
```javascript
await settingsService.update({
  platformName: 'My Custom Name',
  loginHeroImage: 'data:image/png;base64,...'
});
// Saved to localStorage
// Will persist across sessions
```

### Uploading Images
When you upload a hero image or logo:
1. File is converted to base64 data URL
2. Stored in Redux state immediately (preview shows)
3. On "Save Changes", persisted to localStorage
4. Survives page reloads

## Clearing Data
To reset to initial mock data:
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

Or selectively:
```javascript
localStorage.removeItem('busbuddy_drivers');
localStorage.removeItem('busbuddy_settings');
```

## Migration to Real Backend
When connecting to a real backend API:
1. Replace the service method implementations in `UnifiedApiService.js`
2. Remove localStorage calls
3. Add actual HTTP requests via `apiClient`
4. The UI code (hooks, slices) requires **zero changes**

Example migration:
```javascript
// Before (mock with localStorage):
async getAll() {
  const drivers = storage.get('drivers', MOCK_DRIVERS);
  return Promise.resolve({ drivers });
}

// After (real API):
async getAll() {
  return apiClient.get('/api/drivers');
}
```

## Benefits
✅ **Dynamic Updates** - All CRUD operations persist  
✅ **Realistic Testing** - Behaves like a real backend  
✅ **No Data Loss** - Survives page reloads  
✅ **Easy Migration** - Swap to real API without UI changes  
✅ **Offline Capable** - Works without internet  
