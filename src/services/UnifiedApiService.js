/**
 * UnifiedApiService - Entity-specific API services
 * 
 * Smart Data-Flow Principles:
 * 1. Centralized endpoint definitions
 * 2. Consistent response handling
 * 3. Cache invalidation strategies
 * 4. Type-safe entity operations
 * 
 * NOTE: API endpoints are placeholders. Real endpoints will be provided by backend.
 * Until then, this uses localStorage for persistence with proper structure.
 */

import { apiClient } from './ApiClient';
import {
  SCHOOLS,
  MOCK_USERS,
  MOCK_ROUTES,
  MOCK_TRIPS,
  NOTIFICATIONS,
  MOCK_DRIVERS,
  MOCK_STUDENTS
} from '../../services/mockData';

// ============================================
// PERSISTENCE LAYER - localStorage helpers
// ============================================

const STORAGE_PREFIX = 'busbuddy_';

const storage = {
  get(key, defaultValue) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Failed to parse ${key} from localStorage:`, e);
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage:`, e);
    }
  },
  
  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  }
};

/**
 * Initialize localStorage with mock data if empty
 */
const initializeStorage = () => {
  if (!storage.get('schools')) storage.set('schools', SCHOOLS);
  if (!storage.get('drivers')) storage.set('drivers', MOCK_DRIVERS);
  if (!storage.get('routes')) storage.set('routes', MOCK_ROUTES);
  if (!storage.get('trips')) storage.set('trips', MOCK_TRIPS);
  if (!storage.get('students')) storage.set('students', MOCK_STUDENTS);
  if (!storage.get('notifications')) storage.set('notifications', NOTIFICATIONS);
};

// Initialize on load
initializeStorage();

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login user
   * TODO: Wire to real endpoint when available
   * Expected endpoint: POST /auth/login
   * Expected response: { user, token, expiresIn }
   */
  async login(credentials) {
    // Mock implementation - replace with API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.email === credentials.email);
        if (user) {
          const token = `mock_token_${user.id}_${Date.now()}`;
          apiClient.setAuthToken(token);
          resolve({ user, token, expiresIn: 3600 });
        } else {
          throw new Error('Invalid credentials');
        }
      }, 800);
    });
  },

  /**
   * Logout user
   * TODO: Wire to real endpoint when available
   * Expected endpoint: POST /auth/logout
   */
  async logout() {
    apiClient.clearAuthToken();
    return Promise.resolve({ success: true });
  },

  /**
   * Verify token and get current user
   * TODO: Wire to real endpoint when available
   * Expected endpoint: GET /auth/me
   * Expected response: { user }
   */
  async verifyToken() {
    // Mock implementation
    return Promise.resolve({ user: MOCK_USERS[0] });
  },

  /**
   * Request password reset
   * TODO: Wire to real endpoint when available
   * Expected endpoint: POST /auth/forgot-password
   */
  async forgotPassword(email, method) {
    return Promise.resolve({ success: true, message: 'Recovery code sent' });
  }
};

/**
 * School Service
 */
export const schoolService = {
  async getAll(filters = {}) {
    const schools = storage.get('schools', SCHOOLS);
    return Promise.resolve({ schools });
  },

  async getById(id) {
    const schools = storage.get('schools', SCHOOLS);
    const school = schools.find(s => s.id === id);
    return Promise.resolve({ school });
  },

  async create(schoolData) {
    const schools = storage.get('schools', SCHOOLS);
    const newSchool = {
      id: `S${Date.now()}`,
      ...schoolData,
      createdAt: new Date().toISOString()
    };
    storage.set('schools', [...schools, newSchool]);
    apiClient.clearCache('/schools');
    return Promise.resolve({ school: newSchool });
  },

  async update(id, updates) {
    const schools = storage.get('schools', SCHOOLS);
    const updated = schools.map(s => 
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    storage.set('schools', updated);
    apiClient.clearCache('/schools');
    return Promise.resolve({ school: updated.find(s => s.id === id) });
  },

  async delete(id) {
    const schools = storage.get('schools', SCHOOLS);
    storage.set('schools', schools.filter(s => s.id !== id));
    apiClient.clearCache('/schools');
    return Promise.resolve({ success: true });
  }
};

/**
 * Driver Service
 */
export const driverService = {
  async getAll(filters = {}) {
    const drivers = storage.get('drivers', MOCK_DRIVERS);
    return Promise.resolve({ drivers });
  },

  async getById(id) {
    const drivers = storage.get('drivers', MOCK_DRIVERS);
    const driver = drivers.find(d => d.id === id);
    return { driver };
  },

  async create(driverData) {
    const drivers = storage.get('drivers', MOCK_DRIVERS);
    const newDriver = {
      id: `D${Date.now()}`,
      ...driverData,
      createdAt: new Date().toISOString()
    };
    storage.set('drivers', [...drivers, newDriver]);
    apiClient.clearCache('/drivers');
    return Promise.resolve({ driver: newDriver });
  },

  async update(id, updates) {
    const drivers = storage.get('drivers', MOCK_DRIVERS);
    const updated = drivers.map(d =>
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    storage.set('drivers', updated);
    apiClient.clearCache('/drivers');
    return Promise.resolve({ driver: updated.find(d => d.id === id) });
  },

  async delete(id) {
    const drivers = storage.get('drivers', MOCK_DRIVERS);
    storage.set('drivers', drivers.filter(d => d.id !== id));
    apiClient.clearCache('/drivers');
    return Promise.resolve({ success: true });
  }
};

/**
 * Route Service
 */
export const routeService = {
  async getAll(filters = {}) {
    const routes = storage.get('routes', MOCK_ROUTES);
    return Promise.resolve({ routes });
  },

  async getById(id) {
    const routes = storage.get('routes', MOCK_ROUTES);
    const route = routes.find(r => r.id === id);
    return Promise.resolve({ route });
  },

  async create(routeData) {
    const routes = storage.get('routes', MOCK_ROUTES);
    const newRoute = {
      id: `R${Date.now()}`,
      ...routeData,
      createdAt: new Date().toISOString()
    };
    storage.set('routes', [...routes, newRoute]);
    apiClient.clearCache('/routes');
    return Promise.resolve({ route: newRoute });
  },

  async update(id, updates) {
    const routes = storage.get('routes', MOCK_ROUTES);
    const updated = routes.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    storage.set('routes', updated);
    apiClient.clearCache('/routes');
    return Promise.resolve({ route: updated.find(r => r.id === id) });
  },

  async delete(id) {
    const routes = storage.get('routes', MOCK_ROUTES);
    storage.set('routes', routes.filter(r => r.id !== id));
    apiClient.clearCache('/routes');
    return Promise.resolve({ success: true });
  }
};

/**
 * Trip Service
 */
export const tripService = {
  async getAll(filters = {}) {
    const trips = storage.get('trips', MOCK_TRIPS);
    return Promise.resolve({ trips });
  },

  async getById(id) {
    const trips = storage.get('trips', MOCK_TRIPS);
    const trip = trips.find(t => t.id === id);
    return Promise.resolve({ trip });
  },

  async create(tripData) {
    const trips = storage.get('trips', MOCK_TRIPS);
    const newTrip = {
      id: `T${Date.now()}`,
      ...tripData,
      createdAt: new Date().toISOString()
    };
    storage.set('trips', [...trips, newTrip]);
    apiClient.clearCache('/trips');
    return Promise.resolve({ trip: newTrip });
  },

  async update(id, updates) {
    const trips = storage.get('trips', MOCK_TRIPS);
    const updated = trips.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    storage.set('trips', updated);
    apiClient.clearCache('/trips');
    return Promise.resolve({ trip: updated.find(t => t.id === id) });
  },

  async delete(id) {
    const trips = storage.get('trips', MOCK_TRIPS);
    storage.set('trips', trips.filter(t => t.id !== id));
    apiClient.clearCache('/trips');
    return Promise.resolve({ success: true });
  }
};

/**
 * Student Service
 */
export const studentService = {
  async getAll(filters = {}) {
    const students = storage.get('students', MOCK_STUDENTS);
    return Promise.resolve({ students });
  },

  async getById(id) {
    const students = storage.get('students', MOCK_STUDENTS);
    const student = students.find(s => s.id === id);
    return { student };
  },

  async create(studentData) {
    const students = storage.get('students', MOCK_STUDENTS);
    const newStudent = {
      id: `ST${Date.now()}`,
      ...studentData,
      createdAt: new Date().toISOString()
    };
    storage.set('students', [...students, newStudent]);
    apiClient.clearCache('/students');
    return Promise.resolve({ student: newStudent });
  },

  async update(id, updates) {
    const students = storage.get('students', MOCK_STUDENTS);
    const updated = students.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    storage.set('students', updated);
    apiClient.clearCache('/students');
    return Promise.resolve({ student: updated.find(s => s.id === id) });
  },

  async delete(id) {
    const students = storage.get('students', MOCK_STUDENTS);
    storage.set('students', students.filter(s => s.id !== id));
    apiClient.clearCache('/students');
    return Promise.resolve({ success: true });
  },

  async bulkUpload(file) {
    // TODO: Implement CSV/Excel parsing
    apiClient.clearCache('/students');
    return Promise.resolve({ added: 15, updated: 0, failed: 0 });
  }
};

/**
 * Notification Service
 */
export const notificationService = {
  async getAll() {
    const notifications = storage.get('notifications', NOTIFICATIONS);
    return Promise.resolve({ notifications });
  },

  async markAsRead(id) {
    const notifications = storage.get('notifications', NOTIFICATIONS);
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    storage.set('notifications', updated);
    return Promise.resolve({ success: true });
  },

  async markAllAsRead() {
    const notifications = storage.get('notifications', NOTIFICATIONS);
    const updated = notifications.map(n => ({ ...n, read: true }));
    storage.set('notifications', updated);
    return Promise.resolve({ success: true });
  },

  async delete(id) {
    const notifications = storage.get('notifications', NOTIFICATIONS);
    storage.set('notifications', notifications.filter(n => n.id !== id));
    return Promise.resolve({ success: true });
  }
};

/**
 * Settings Service
 */
export const settingsService = {
  async get() {
    // Try to get settings from localStorage first
    const saved = localStorage.getItem('busbuddy_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🔄 Loading settings from localStorage:', parsed);
        return Promise.resolve({ settings: parsed });
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    
    console.log('🆕 No saved settings found, using defaults');
    
    // Fallback to mock settings
    const mockSettings = {
      platformName: 'Bus Buddy',
      colors: {
        primary: '#ff3600',
        secondary: '#1fd701',
        surface: '#f8fafc',
        statusActive: '#1fd701',
        statusScheduled: '#bda8ff',
        statusWarning: '#ff9d00',
        statusCompleted: '#FF6106'
      },
      loginHeroImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop',
      heroMode: 'url',
      uploadedHeroImage: null,
      logoMode: 'url',
      logoUrls: { light: '', dark: '', platform: '' },
      uploadedLogos: { light: null, dark: null, platform: null },
      testimonials: [
        { id: '1', name: 'Riaot Escanor', role: 'Project Manager at Google', text: 'I Landed Multiple Projects Within A Couple Of Days - With This Tool. Definitely My Go To Freelance Platform Now!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop' }
      ],
      permissionGroups: []
    };
    return Promise.resolve({ settings: mockSettings });
  },

  async update(updates) {
    // TODO: Wire to real endpoint when available
    // Expected endpoint: PUT /settings
    // Expected request: { ...updates }
    // Expected response: { settings }
    
    console.log('📝 Persisting settings to localStorage:', updates);
    
    // Persist to localStorage
    localStorage.setItem('busbuddy_settings', JSON.stringify(updates));
    
    // Verify it was saved
    const saved = localStorage.getItem('busbuddy_settings');
    console.log('✅ Settings saved. Verification:', JSON.parse(saved));
    
    apiClient.clearCache('/settings');
    return Promise.resolve({ settings: updates });
  },

  async uploadImage(formData) {
    // TODO: Wire to real endpoint when available
    // Expected endpoint: POST /settings/upload
    // Expected request: FormData with 'file' and 'type' fields
    // Expected response: { url, fileName, type }
    
    // Mock implementation - simulate upload delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const type = formData.get('type');
        const file = formData.get('file');
        // In real implementation, this would return the uploaded file URL from the server
        resolve({
          url: `https://example.com/uploads/${file.name}`,
          fileName: file.name,
          type
        });
      }, 1000);
    });
  }
};
