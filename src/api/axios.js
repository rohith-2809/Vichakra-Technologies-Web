import axios from 'axios';

// In-memory access token (never stored in localStorage)
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send httpOnly refresh-token cookie automatically
});

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response interceptor: silent refresh on 401 ───────────────────────────
let isRefreshing  = false;
let refreshQueue  = []; // queued requests waiting for new token

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Never intercept auth endpoints — avoids infinite loops and swallowed login errors
    const isAuthCall = original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/login');

    // Only attempt silent refresh on 401, first retry only, and not on auth endpoints
    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
