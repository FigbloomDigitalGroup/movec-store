import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true,
});

let csrfToken: string | null = null;

// Tracks whether the app believes there's an active session (set by authStore on
// login/loadUser/logout). Without this, every 401 — including the background
// loadUser() check that runs on every page load for anonymous visitors — would
// attempt a refresh and hard-redirect to /login even though the visitor never had
// a session to begin with.
let hasSession = false;
export function setHasSession(value: boolean) {
  hasSession = value;
}

const fetchCsrfToken = () =>
  api.get('/auth/csrf').then(({ data }) => {
    csrfToken = data.csrfToken;
  }).catch(() => {});

fetchCsrfToken();

api.interceptors.request.use((config) => {
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && hasSession) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch {
        setHasSession(false);
        window.location.href = '/login';
      }
    }

    if (
      error.response?.status === 403 &&
      error.response?.data?.message === 'Invalid CSRF token' &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      await fetchCsrfToken();
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: any): string => {
  if (!error.response) {
    return error.message || 'Network error occurred. Please try again.';
  }
  const data = error.response.data;
  if (data) {
    if (data.error && data.error.message) {
      return Array.isArray(data.error.message)
        ? data.error.message.join(', ')
        : data.error.message;
    }
    if (data.message) {
      return Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
    }
  }
  return 'An unexpected error occurred.';
};

// ─── Module API helpers ─────────────────────────────────────────────
export const getModules = () => api.get('/modules').then((r) => r.data);

export const getModule = (slug: string) =>
  api.get(`/modules/${slug}`).then((r) => r.data);

export const getModuleProducts = (slug: string, params?: Record<string, string>) =>
  api.get(`/modules/${slug}/products`, { params }).then(r => r.data);

export const resendVerification = (email: string) =>
  api.post('/auth/resend-verification', { email }).then(r => r.data);

export default api;