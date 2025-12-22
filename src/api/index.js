import axios from 'axios';

// API Configuration
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000') + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { accessToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Service
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
    sendOTP: (email, type = 'email_verification') => api.post('/auth/send-otp', { email, type }),
    verifyOTP: (email, code, type = 'email_verification') => api.post('/auth/verify-otp', { email, code, type }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (email, code, password) => api.post('/auth/reset-password', { email, code, password }),
  },

  // User endpoints
  users: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.put('/users/profile', userData),
    uploadAvatar: (formData) => api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    changePassword: (passwordData) => api.put('/users/password', passwordData),
    getFavorites: (params = {}) => api.get('/users/favorites', { params }),
    getReviews: (params = {}) => api.get('/users/reviews', { params }),
    getNotifications: (params = {}) => api.get('/notifications', { params }),
    markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
    markAllNotificationsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    deleteAccount: () => api.delete('/users/account'),
  },

  // Listings endpoints
  listings: {
    getAll: (params = {}) => api.get('/listings', { params }),
    getById: (id) => api.get(`/listings/${id}`),
    create: (formData) => api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/listings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/listings/${id}`),
    toggleFavorite: (id) => api.post(`/listings/${id}/favorite`),
    report: (id, reportData) => api.post(`/listings/${id}/report`, reportData),
    getUserListings: (params = {}) => api.get('/listings/user', { params }),
  },

  // Categories endpoints
  categories: {
    getAll: (params = {}) => api.get('/categories', { params }),
    getById: (slug) => api.get(`/categories/${slug}`),
    getTree: () => api.get('/categories/tree/all'),
    getPopular: (params = {}) => api.get('/categories/popular/list', { params }),
  },

  // Payments endpoints
  payments: {
    createIntent: (paymentData) => api.post('/payments/create-intent', paymentData),
    confirmStripe: (paymentData) => api.post('/payments/confirm-stripe', paymentData),
    confirmPayPal: (paymentData) => api.post('/payments/confirm-paypal', paymentData),
    confirmChapa: (paymentData) => api.post('/payments/confirm-chapa', paymentData),
    confirmTeleBirr: (paymentData) => api.post('/payments/confirm-telebirr', paymentData),
    getHistory: (params = {}) => api.get('/payments/history', { params }),
  },

  // Chat endpoints
  chat: {
    getRooms: (params = {}) => api.get('/chat/rooms', { params }),
    getRoom: (id, params = {}) => api.get(`/chat/rooms/${id}`, { params }),
    createRoom: (roomData) => api.post('/chat/rooms', roomData),
    sendMessage: (id, messageData) => api.post(`/chat/rooms/${id}/messages`, messageData),
    markRead: (id) => api.put(`/chat/rooms/${id}/read`),
    deleteMessage: (roomId, messageId) => api.delete(`/chat/rooms/${roomId}/messages/${messageId}`),
    deleteRoom: (id) => api.delete(`/chat/rooms/${id}`),
    getUnreadCount: () => api.get('/chat/unread-count'),
  },

  // Upload endpoints
  upload: {
    uploadSingle: (formData) => api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadMultiple: (formData) => api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteFile: (filename) => api.delete(`/upload/${filename}`),
    getFileInfo: (filename) => api.get(`/upload/${filename}/info`),
  },

  // Admin endpoints
  admin: {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params = {}) => api.get('/admin/users', { params }),
    updateUserStatus: (id, statusData) => api.put(`/admin/users/${id}/status`, statusData),
    getListings: (params = {}) => api.get('/admin/listings', { params }),
    updateListingStatus: (id, statusData) => api.put(`/admin/listings/${id}/status`, statusData),
    getTransactions: (params = {}) => api.get('/admin/transactions', { params }),
    getReports: (params = {}) => api.get('/admin/reports', { params }),
    updateReportStatus: (id, statusData) => api.put(`/admin/reports/${id}/status`, statusData),
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (settings) => api.put('/admin/settings', settings),
    getLogs: (params = {}) => api.get('/admin/logs', { params }),
  },

  // Analytics endpoints
  analytics: {
    getDashboard: (params = {}) => api.get('/analytics/dashboard', { params }),
    getUsers: (params = {}) => api.get('/analytics/users', { params }),
    getListings: (params = {}) => api.get('/analytics/listings', { params }),
    getRevenue: (params = {}) => api.get('/analytics/revenue', { params }),
    getSystem: () => api.get('/analytics/system'),
  },
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

