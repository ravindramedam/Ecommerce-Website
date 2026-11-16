// frontend-user/src/services/apiService.js

import axios from 'axios';

const apiService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
});

apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized - clearing token");
      localStorage.removeItem('token');

      if (typeof window !== 'undefined') {
        const protectedPaths = ['/dashboard', '/account', '/checkout', '/orders'];
        const current = window.location.pathname;

        const shouldRedirect = protectedPaths.some((p) =>
          current.startsWith(p)
        );

        if (shouldRedirect) {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiService;
