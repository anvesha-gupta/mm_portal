import axios from 'axios';
import { msalInstance } from '../auth/msalInstance';
import { loginRequest } from '../auth/msalConfig';

const STORAGE_AUTH_TOKEN_KEY = 'mm_auth_token';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthToken = async (): Promise<string | null> => {
  let token = localStorage.getItem(STORAGE_AUTH_TOKEN_KEY);
  if (!token) {
    try {
      const result = await msalInstance.acquireTokenSilent(loginRequest);
      token = result.idToken ?? result.accessToken ?? null;
      if (token) {
        localStorage.setItem(STORAGE_AUTH_TOKEN_KEY, token);
      }
    } catch {
      token = null;
    }
  }
  return token;
};

api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
