import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campustrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const metaAPI = {
  getCategories: () => api.get('/meta/categories'),
  getLocations: () => api.get('/meta/locations'),
  getPublicStats: () => api.get('/meta/public-stats')
};

export const lostAPI = {
  create: (data) => api.post('/lost-items', data),
  getAll: (params) => api.get('/lost-items', { params }),
  getById: (id) => api.get(`/lost-items/${id}`),
  getMy: () => api.get('/lost-items/my')
};

export const foundAPI = {
  create: (data) => api.post('/found-items', data),
  getAll: (params) => api.get('/found-items', { params }),
  getById: (id) => api.get(`/found-items/${id}`),
  getMy: () => api.get('/found-items/my')
};

export const matchAPI = {
  getAll: (params) => api.get('/matches', { params }),
  getMy: () => api.get('/matches/my'),
  getById: (id) => api.get(`/matches/${id}`),
  verify: (id, status) => api.put(`/matches/${id}/verify`, { status })
};

export const claimAPI = {
  create: (data) => api.post('/claims', data),
  getMy: () => api.get('/claims/my'),
  getById: (id) => api.get(`/claims/${id}`)
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getCategoryAnalytics: () => api.get('/admin/analytics/categories'),
  getLocationAnalytics: () => api.get('/admin/analytics/locations'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getAllClaims: (params) => api.get('/admin/claims', { params }),
  reviewClaim: (id, action, remarks) => api.put(`/admin/claims/${id}/review`, { action, remarks }),
  closeCase: (id, notes) => api.put(`/admin/claims/${id}/close`, { notes }),
  updateItemStatus: (type, id, status, notes) => api.put(`/admin/items/${type}/${id}/status`, { status, notes }),
  getAuditLogs: () => api.get('/admin/audit-logs')
};

export default api;
