import { authApi } from './authApi';

export default {
  login(username: string, password: string) {
    return authApi.post('/login', { username, password });
  },
  logout() {
    return authApi.post('/logout');
  },
  refresh() {
    return authApi.post('/refresh');
  },
  tokenStatus() {
    return authApi.get('/token-status');
  },
};
