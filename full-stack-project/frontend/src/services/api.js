/**
 * Axios API Client
 * Centralized HTTP client with JWT interceptor.
 * All API calls go through the backend — never directly to n8n.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minute timeout for AI responses
});

// ─── Request interceptor: attach JWT to every request ──────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 → redirect to login ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (fullName, email, password) => api.post('/auth/register', { fullName, email, password }),
};

// ─── Chat ──────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (message, file) => {
    const formData = new FormData();
    if (message) formData.append('message', message);
    if (file) formData.append('file', file);
    return api.post('/chat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
};

// ─── Ingestion / Upload ────────────────────────────────────
export const ingestAPI = {
  uploadFiles: (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post('/ingest', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });
  },
};

export default api;
