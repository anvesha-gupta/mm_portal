import axios from 'axios';
import { msalInstance } from '../auth/msalInstance';
import { loginRequest } from '../auth/msalConfig';

const STORAGE_AUTH_TOKEN_KEY = 'mm_auth_token';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthToken = async (): Promise<string | null> => {
  let token = localStorage.getItem(STORAGE_AUTH_TOKEN_KEY);

  if (!token) {
    const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    if (!account) {
      return null;
    }

    try {
      const result = await msalInstance.acquireTokenSilent({
        account,
        scopes: loginRequest.scopes,
      });
      token = result.accessToken || result.idToken || null;
      if (token) {
        localStorage.setItem(STORAGE_AUTH_TOKEN_KEY, token);
      }
    } catch (error) {
      console.warn('Token acquisition failed', error);
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
  (error) => Promise.reject(error),
);

export default api;
