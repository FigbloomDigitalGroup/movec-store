import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('http://localhost:4000/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
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
  api
    .get(`/modules/${slug}/products`, { params })
    .then((r) => r.data);

export default api;