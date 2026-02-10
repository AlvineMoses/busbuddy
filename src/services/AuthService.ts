/**
 * AuthService - Centralized Authentication State Management
 *
 * SMART DATA-FLOW Principles:
 * ─────────────────────────────
 * 1. SINGLE SOURCE OF TRUTH — All auth state (token, user, session) lives here.
 * 2. TOKEN LIFECYCLE — Login stores token, logout clears it, refresh renews it.
 * 3. PERSISTENCE — Token + user persisted to localStorage for session survival.
 * 4. API-READY — Mock implementations use the same interface as real API calls.
 * 5. EVENT-DRIVEN — Notifies listeners on auth state changes (login, logout, expiry).
 */

import { apiClient } from './ApiClient';
import { API } from '../config/apiEndpoints';
import { MOCK_USERS } from '../../services/mockData';
import type { User } from '../../types';

// ============================================
// TYPES
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export type AuthChangeCallback = (user: User | null) => void;

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  TOKEN: 'busbuddy_auth_token',
  USER: 'busbuddy_auth_user',
  REFRESH_TOKEN: 'busbuddy_refresh_token',
} as const;

// ============================================
// AUTH SERVICE
// ============================================

class AuthService {
  private _user: User | null = null;
  private _token: string | null = null;
  private _refreshToken: string | null = null;
  private _listeners: AuthChangeCallback[] = [];
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this._hydrate();
  }

  // ──────────────────────────────────────────
  // PUBLIC GETTERS
  // ──────────────────────────────────────────

  get user(): User | null { return this._user; }
  get token(): string | null { return this._token; }
  get isAuthenticated(): boolean { return !!this._user && !!this._token; }

  // ──────────────────────────────────────────
  // AUTH ACTIONS
  // ──────────────────────────────────────────

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    // ── MOCK ──
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.email === credentials.email);
        if (!user) {
          reject(new Error('Invalid credentials'));
          return;
        }

        const token = `mock_token_${user.id}_${Date.now()}`;
        const refreshToken = `mock_refresh_${user.id}_${Date.now()}`;

        this._setSession(user, token, refreshToken);
        resolve({ user, token });
      }, 600);
    });

    // ── REAL (uncomment when backend is ready) ──
    // const data = await apiClient.post<LoginResult & { refreshToken: string }>(API.AUTH.LOGIN, credentials as unknown as Record<string, unknown>);
    // this._setSession(data.user, data.token, data.refreshToken);
    // return { user: data.user, token: data.token };
  }

  loginDirect(user: User): LoginResult {
    const token = `mock_token_${user.id}_${Date.now()}`;
    this._setSession(user, token, null);
    return { user, token };
  }

  async logout(): Promise<void> {
    this._clearSession();

    // ── REAL ──
    // try { await apiClient.post(API.AUTH.LOGOUT, {}, { cache: false }); } catch {}
    // this._clearSession();
  }

  async verifySession(): Promise<User | null> {
    if (!this._token) return null;

    // ── MOCK ──
    return this._user;

    // ── REAL ──
    // try {
    //   const data = await apiClient.get<{ user: User }>(API.AUTH.ME, { cache: false });
    //   this._user = data.user;
    //   this._persist();
    //   return data.user;
    // } catch {
    //   this._clearSession();
    //   return null;
    // }
  }

  async forgotPassword(email: string, method: 'email' | 'sms' = 'email'): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Recovery code sent via ${method}` };
  }

  async verifyOtp(email: string, code: string): Promise<{ success: boolean; resetToken: string }> {
    return { success: true, resetToken: `mock_reset_${Date.now()}` };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async refreshAccessToken(): Promise<string | null> {
    if (!this._refreshToken) return null;

    // ── MOCK ──
    const newToken = `mock_token_${this._user?.id}_${Date.now()}`;
    this._token = newToken;
    apiClient.setAuthToken(newToken);
    this._persist();
    return newToken;
  }

  // ──────────────────────────────────────────
  // EVENT LISTENERS
  // ──────────────────────────────────────────

  onAuthChange(callback: AuthChangeCallback): () => void {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  }

  // ──────────────────────────────────────────
  // INTERNAL HELPERS
  // ──────────────────────────────────────────

  private _setSession(user: User, token: string, refreshToken: string | null): void {
    this._user = user;
    this._token = token;
    this._refreshToken = refreshToken;

    apiClient.setAuthToken(token);
    this._persist();
    this._notify();
  }

  private _clearSession(): void {
    this._user = null;
    this._token = null;
    this._refreshToken = null;

    apiClient.clearAuthToken();
    apiClient.clearCache();

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }

    this._notify();
  }

  private _persist(): void {
    try {
      if (this._token) localStorage.setItem(STORAGE_KEYS.TOKEN, this._token);
      if (this._user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this._user));
      if (this._refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this._refreshToken);
    } catch (e) {
      console.error('AuthService: Failed to persist session:', e);
    }
  }

  private _hydrate(): void {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userJson = localStorage.getItem(STORAGE_KEYS.USER);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (token && userJson) {
        this._token = token;
        this._user = JSON.parse(userJson) as User;
        this._refreshToken = refreshToken;
        apiClient.setAuthToken(token);
      }
    } catch (e) {
      console.error('AuthService: Failed to hydrate session:', e);
      this._clearSession();
    }
  }

  private _notify(): void {
    this._listeners.forEach(cb => {
      try { cb(this._user); }
      catch (e) { console.error('AuthService listener error:', e); }
    });
  }

  private _scheduleRefresh(expiresInSeconds: number): void {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);

    const delay = Math.max((expiresInSeconds - 60) * 1000, 0);
    this._refreshTimer = setTimeout(() => {
      this.refreshAccessToken().catch(err => {
        console.error('AuthService: Auto-refresh failed:', err);
        this._clearSession();
      });
    }, delay);
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================
export const authService = new AuthService();
export default authService;
