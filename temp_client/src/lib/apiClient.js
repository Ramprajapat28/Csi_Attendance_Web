import axios from 'axios';
import useAuthStore from './authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response } = error || {};
    if (response?.status === 401) {
      // Optionally, implement refresh logic here if backend provides a refresh endpoint
      useAuthStore.getState().logout();
      // window.location = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
