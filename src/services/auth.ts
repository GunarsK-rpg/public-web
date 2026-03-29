import { authApi } from './authApi';

export const OAUTH_REMEMBER_ME_KEY = 'oauth_remember_me';
export const OAUTH_REDIRECT_KEY = 'oauth_redirect';

export interface LoginResponse {
  success: boolean;
  expires_in: number;
  user_id?: number;
  username?: string;
  email?: string;
  email_verified?: boolean;
  display_name?: string;
  scopes?: Record<string, string>;
}

export interface RegisterResponse {
  user_id: number;
  username: string;
  email: string;
}

export interface TokenStatusResponse {
  valid: boolean;
  ttl_seconds: number;
  user_id?: number;
  username?: string;
  email?: string;
  email_verified?: boolean;
  display_name?: string;
  scopes?: Record<string, string>;
}

export interface ProfileResponse {
  user_id: number;
  username: string;
  email: string;
  email_verified: boolean;
  display_name: string | null;
}

export interface GoogleLoginResponse {
  url: string;
}

export interface AuthMethodsResponse {
  has_password: boolean;
  providers: string[];
}

export default {
  login(identifier: string, password: string, rememberMe: boolean) {
    return authApi.post<LoginResponse>('/login', { identifier, password, remember_me: rememberMe });
  },
  logout() {
    return authApi.post('/logout');
  },
  refresh() {
    return authApi.post<LoginResponse>('/refresh');
  },
  tokenStatus() {
    return authApi.get<TokenStatusResponse>('/token-status');
  },
  register(data: { username: string; email: string; password: string }) {
    return authApi.post<RegisterResponse>('/register', { ...data, role_code: 'rpg-player' });
  },
  sendVerification() {
    return authApi.post('/send-verification');
  },
  verifyEmail(token: string) {
    return authApi.post('/verify-email', { token });
  },
  updateProfile(data: { username?: string; email?: string; display_name?: string }) {
    return authApi.patch<ProfileResponse>('/profile', data);
  },
  changePassword(currentPassword: string, newPassword: string) {
    return authApi.post('/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
  forgotPassword(email: string) {
    return authApi.post('/forgot-password', { email });
  },
  resetPassword(token: string, newPassword: string) {
    return authApi.post('/reset-password', { token, new_password: newPassword });
  },
  googleLogin() {
    return authApi.get<GoogleLoginResponse>('/oauth/google/login');
  },
  googleCallback(code: string, state: string, rememberMe: boolean) {
    return authApi.post<LoginResponse>('/oauth/google/callback', {
      code,
      state,
      remember_me: rememberMe,
    });
  },
  getAuthMethods() {
    return authApi.get<AuthMethodsResponse>('/auth-methods');
  },
  setPassword(password: string, confirmPassword: string) {
    return authApi.post('/set-password', { password, confirm_password: confirmPassword });
  },
};
