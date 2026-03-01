import { authApi } from './authApi';

export interface LoginResponse {
  success: boolean;
  expires_in: number;
  user_id?: number;
  username?: string;
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
  username?: string;
  scopes?: Record<string, string>;
}

export default {
  login(username: string, password: string) {
    return authApi.post<LoginResponse>('/login', { username, password });
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
};
