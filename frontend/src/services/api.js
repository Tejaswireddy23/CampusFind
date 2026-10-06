import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusfind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration cleanly
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (
        currentPath !== '/login' &&
        currentPath !== '/register' &&
        currentPath !== '/' &&
        currentPath !== '/account-status' &&
        currentPath !== '/registration-success'
      ) {
        localStorage.removeItem('campusfind_token');
        localStorage.removeItem('campusfind_user');
        // Optional redirect if expired
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
