import axios from 'axios';
import { env } from 'src/config/env';
import { API_TIMEOUTS } from 'src/config/api';

export const authApi = axios.create({
  baseURL: env.authUrl,
  timeout: API_TIMEOUTS.AUTH,
  withCredentials: true,
});
