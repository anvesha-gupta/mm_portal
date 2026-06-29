import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach authorization headers when available.
// TODO: Once Azure AD / MSAL is integrated, obtain the access token here and
// attach it to `config.headers.Authorization = `Bearer ${token}``.
api.interceptors.request.use(
  async (config) => {
    // Placeholder: no token available yet. Keep hook for future integration.
    // Example once implemented:
    // const token = await tokenProvider.getAccessToken();
    // if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
