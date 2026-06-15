import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Important for cookies!
});

// Auth endpoints
export const authAPI = {
  register: (data) => apiClient.post('/api/auth/register', data),
  login: (data) => apiClient.post('/api/auth/login', data),
  logout: () => apiClient.post('/api/auth/logout'),
  checkAuth: () => apiClient.get('/api/auth/me'),
};
