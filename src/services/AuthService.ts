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
import { UserRole, type User } from '../../types';

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

// ── Forgot Password Response Types ──

export interface ForgotPasswordPendingResponse {
  status: 'pending';
  message: string;
  otp_token: string;
}

export interface OtpChannelOptions {
  EMAIL?: string;
  SMS?: string;
  WHATSAPP?: string;
  INAPPNOTIFICATION?: string;
}

export interface ForgotPasswordChooseChannelResponse {
  status: 'choose_otp_channel';
  message: string;
  otp_options: OtpChannelOptions;
  otp_channel_token: string;
}

export type ForgotPasswordResponse = ForgotPasswordPendingResponse | ForgotPasswordChooseChannelResponse;

export interface PreferredChannelResponse {
  status: string;
  message: string;
  otp_token: string;
}

export interface ResetPasswordResponse {
  status: string;
  message: string;
}

export type OtpChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'INAPPNOTIFICATION';

export type AuthChangeCallback = (user: User | null) => void;

// ── Login Response Types ──

export interface LoginDirectResult {
  status: 'success';
  user: User;
  token: string;
}

export interface LoginOtpRequiredResult {
  status: 'otp_required';
  otp_channel_token: string;
  otp_options?: OtpChannelOptions;
  message?: string;
}

export type LoginResponse = LoginDirectResult | LoginOtpRequiredResult;

export interface VerifyLoginOtpResult {
  user: User;
  token: string;
}

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  TOKEN: 'busbuddy_auth_token',
  USER: 'busbuddy_auth_user',
  REFRESH_TOKEN: 'busbuddy_refresh_token',
} as const;

// ============================================
// DEMO MODE HELPER
// ============================================

const _isDemoMode = (): boolean => {
  try {
    const raw = localStorage.getItem('busbuddy_settings');
    if (raw) {
      const settings = JSON.parse(raw);
      if (settings.featureFlags && typeof settings.featureFlags.demoMode === 'boolean') {
        return settings.featureFlags.demoMode;
      }
    }
  } catch { /* default */ }
  return true; // Default: demo mode ON
};

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

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // ── DEMO MODE ──
    if (_isDemoMode()) {
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
          resolve({ status: 'success', user, token });
        }, 600);
      });
    }

    // ── PRODUCTION MODE ──
    const data = await apiClient.post<any>(
      API.AUTH.LOGIN,
      credentials as unknown as Record<string, unknown>,
      { cache: false }
    );

    // Direct login — API returned access_token
    if (data.access_token) {
      apiClient.setAuthToken(data.access_token);
      const user = await this._fetchCurrentUser();
      this._setSession(user, data.access_token, data.refresh_token || null);
      return { status: 'success', user, token: data.access_token };
    }

    // OTP required — API returned otp_channel_token
    if (data.otp_channel_token) {
      return {
        status: 'otp_required',
        otp_channel_token: data.otp_channel_token,
        otp_options: data.otp_options,
        message: data.message,
      };
    }

    throw new Error(data.message || 'Login failed');
  }

  loginDirect(user: User): LoginResult {
    const token = `mock_token_${user.id}_${Date.now()}`;
    this._setSession(user, token, null);
    return { user, token };
  }

  /**
   * Verify OTP for login flow — completes login after OTP channel selection.
   */
  async verifyLoginOtp(otpCode: string, otpToken: string): Promise<LoginResult> {
    const data = await apiClient.post<any>(
      API.AUTH.VERIFY_OTP,
      { otp: otpCode, otp_token: otpToken } as unknown as Record<string, unknown>,
      { cache: false }
    );
    if (!data.access_token) throw new Error(data.message || 'OTP verification failed');

    apiClient.setAuthToken(data.access_token);
    const user = await this._fetchCurrentUser();
    this._setSession(user, data.access_token, data.refresh_token || null);
    return { user, token: data.access_token };
  }

  /**
   * Resend OTP for login flow (different endpoint from forgot-password resend).
   */
  async resendLoginOtp(email: string): Promise<{ message?: string }> {
    const data = await apiClient.post<any>(
      API.AUTH.RESEND_OTP_LOGIN,
      { email } as unknown as Record<string, unknown>,
      { cache: false }
    );
    return data;
  }

  async logout(): Promise<void> {
    if (!_isDemoMode() && this._token) {
      try {
        await apiClient.post(API.AUTH.LOGOUT, {}, { cache: false });
      } catch {
        // Proceed with local cleanup even if API call fails
      }
    }
    this._clearSession();
  }

  async verifySession(): Promise<User | null> {
    if (!this._token) return null;

    // ── DEMO MODE ──
    if (_isDemoMode()) return this._user;

    // ── PRODUCTION MODE ──
    try {
      const user = await this._fetchCurrentUser();
      this._user = user;
      this._persist();
      return user;
    } catch {
      this._clearSession();
      return null;
    }
  }

  /**
   * Step 1: Request password reset — sends OTP to the user.
   * Returns either:
   *   - status: 'pending' + otp_token (OTP sent directly)
   *   - status: 'choose_otp_channel' + otp_options + otp_channel_token (user must pick channel)
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const data = await apiClient.post<ForgotPasswordResponse>(
      API.AUTH.FORGOT_PASSWORD,
      { email } as unknown as Record<string, unknown>,
      { cache: false }
    );
    return data;
  }

  /**
   * Step 1b: User picks preferred OTP channel (only when status === 'choose_otp_channel').
   */
  async selectOtpChannel(channel: OtpChannel, otpChannelToken: string): Promise<PreferredChannelResponse> {
    const data = await apiClient.post<PreferredChannelResponse>(
      API.AUTH.PREFERRED_OTP_CHANNEL,
      { send_to: channel, otp_channel_token: otpChannelToken } as unknown as Record<string, unknown>,
      { cache: false }
    );
    return data;
  }

  /**
   * Step 2: Reset password with OTP code + new password + the otp_token/reset_otp_token.
   */
  async resetPassword(otp: string, newPassword: string, resetOtpToken: string): Promise<ResetPasswordResponse> {
    const data = await apiClient.post<ResetPasswordResponse>(
      API.AUTH.RESET_PASSWORD,
      { otp, new_password: newPassword, reset_otp_token: resetOtpToken } as unknown as Record<string, unknown>,
      { cache: false }
    );
    return data;
  }

  /**
   * Resend OTP for forgot-password flow.
   */
  async resendOtp(email: string): Promise<ForgotPasswordResponse> {
    const data = await apiClient.post<ForgotPasswordResponse>(
      API.AUTH.RESEND_OTP,
      { email } as unknown as Record<string, unknown>,
      { cache: false }
    );
    return data;
  }

  async refreshAccessToken(): Promise<string | null> {
    if (!this._refreshToken) return null;

    // ── DEMO MODE ──
    if (_isDemoMode()) {
      const newToken = `mock_token_${this._user?.id}_${Date.now()}`;
      this._token = newToken;
      apiClient.setAuthToken(newToken);
      this._persist();
      return newToken;
    }

    // ── PRODUCTION MODE ──
    try {
      const data = await apiClient.post<any>(
        API.AUTH.REFRESH_TOKEN,
        { refresh_token: this._refreshToken } as unknown as Record<string, unknown>,
        { cache: false }
      );
      if (data.access_token) {
        this._token = data.access_token;
        if (data.refresh_token) this._refreshToken = data.refresh_token;
        apiClient.setAuthToken(data.access_token);
        this._persist();
        return data.access_token;
      }
      throw new Error('No access_token in refresh response');
    } catch (err) {
      console.error('AuthService: Token refresh failed:', err);
      this._clearSession();
      return null;
    }
  }

  /**
   * Fetch all user accounts linked to the authenticated user.
   */
  async getUserAccounts(): Promise<any[]> {
    const data = await apiClient.get<any>(API.AUTH.USER_ACCOUNTS, { cache: false });
    return data.accounts || data || [];
  }

  /**
   * Verify account via token (e.g. email verification link).
   */
  async verifyAccount(verifyToken: string): Promise<any> {
    const data = await apiClient.get<any>(
      `${API.AUTH.VERIFY_ACCOUNT}?token=${verifyToken}`,
      { cache: false }
    );
    return data;
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

  /**
   * Fetch the current user profile from /auth/me.
   */
  private async _fetchCurrentUser(): Promise<User> {
    const data = await apiClient.get<any>(API.AUTH.ME, { cache: false });
    return this._mapApiUser(data.user || data);
  }

  /**
   * Map raw API user data to our User interface.
   */
  private _mapApiUser(apiUser: any): User {
    return {
      id: String(apiUser.id || apiUser._id || ''),
      name: apiUser.name || `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.email || '',
      email: apiUser.email || '',
      role: this._mapRole(apiUser.role || apiUser.user_type || ''),
      avatarUrl: apiUser.avatar_url || apiUser.avatarUrl || apiUser.profile_image || '',
      schoolId: apiUser.school_id || apiUser.schoolId || undefined,
    };
  }

  /**
   * Map API role string to UserRole enum.
   */
  private _mapRole(role: string): UserRole {
    const upper = String(role).toUpperCase();
    if (upper.includes('SUPER')) return UserRole.SUPER_ADMIN;
    if (upper === 'ADMIN' || upper.includes('TRANSPORT')) return UserRole.ADMIN;
    return UserRole.SCHOOL_ADMIN;
  }

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
