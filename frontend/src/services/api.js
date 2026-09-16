import axios from 'axios';
import {
  mockCategories,
  mockLocations,
  mockStudentUser,
  mockAdminUser,
  mockLostItems,
  mockFoundItems,
  mockMatches,
  mockClaims,
  mockDashboard,
  mockAuditLogs
} from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
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

// Response Interceptor with Cloud Preview Fallback
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toLowerCase();

    // When deployed on Vercel without a configured backend, Vercel returns 405 (Method Not Allowed)
    // or 404 or network failure. We provide seamless interactive Cloud Preview fallback.
    const isBackendUnavailable = status === 405 || status === 404 || error.code === 'ERR_NETWORK';

    if (isBackendUnavailable) {
      console.warn(`[CampusTrack] Backend not reachable at ${url}. Activating Cloud Showcase Mode.`);

      // Authentication endpoints
      if (url.includes('/auth/login')) {
        let payload = {};
        try { payload = typeof error.config.data === 'string' ? JSON.parse(error.config.data) : (error.config.data || {}); } catch(e) {}
        const isAdmin = payload.email && (payload.email.includes('admin') || payload.email === 'admin@campustrack.edu');
        const user = isAdmin ? mockAdminUser : mockStudentUser;
        const token = isAdmin ? 'demo-admin-token-cloud-preview' : 'demo-student-token-cloud-preview';
        return Promise.resolve({
          success: true,
          token,
          user,
          message: 'Logged in successfully (Cloud Showcase Mode).'
        });
      }

      if (url.includes('/auth/me')) {
        const token = localStorage.getItem('campustrack_token') || '';
        const isAdmin = token.includes('admin');
        return Promise.resolve({
          success: true,
          user: isAdmin ? mockAdminUser : mockStudentUser
        });
      }

      if (url.includes('/auth/register')) {
        return Promise.resolve({
          success: true,
          token: 'demo-student-token-cloud-preview',
          user: mockStudentUser,
          message: 'Student account registered (Cloud Showcase Mode).'
        });
      }

      // Metadata endpoints
      if (url.includes('/meta/categories')) {
        return Promise.resolve({ success: true, categories: mockCategories });
      }

      if (url.includes('/meta/locations')) {
        return Promise.resolve({ success: true, locations: mockLocations });
      }

      if (url.includes('/meta/public-stats')) {
        return Promise.resolve({ success: true, stats: mockDashboard.kpis });
      }

      // Lost items
      if (url.includes('/lost-items')) {
        if (method === 'post') {
          return Promise.resolve({
            success: true,
            message: 'Lost item report filed successfully (Cloud Showcase Mode).',
            lostItem: mockLostItems[0],
            potentialMatchesCount: 1
          });
        }
        return Promise.resolve({ success: true, items: mockLostItems, count: mockLostItems.length });
      }

      // Found items
      if (url.includes('/found-items')) {
        if (method === 'post') {
          return Promise.resolve({
            success: true,
            message: 'Found item registered successfully (Cloud Showcase Mode).',
            foundItem: mockFoundItems[0],
            potentialMatchesCount: 1
          });
        }
        return Promise.resolve({ success: true, items: mockFoundItems, count: mockFoundItems.length });
      }

      // Matches
      if (url.includes('/matches')) {
        return Promise.resolve({ success: true, matches: mockMatches, count: mockMatches.length });
      }

      // Claims
      if (url.includes('/claims')) {
        if (method === 'post') {
          return Promise.resolve({
            success: true,
            message: 'Claim #CLM-101 submitted for verification (Cloud Showcase Mode).',
            claim_id: 101
          });
        }
        return Promise.resolve({ success: true, claims: mockClaims, count: mockClaims.length });
      }

      // Admin endpoints
      if (url.includes('/admin/dashboard')) {
        return Promise.resolve({ success: true, ...mockDashboard });
      }

      if (url.includes('/admin/analytics/categories')) {
        return Promise.resolve({ success: true, stats: mockDashboard.charts.categoryDistribution });
      }

      if (url.includes('/admin/analytics/locations')) {
        return Promise.resolve({ success: true, stats: mockDashboard.charts.locationDistribution });
      }

      if (url.includes('/admin/students')) {
        return Promise.resolve({ success: true, students: [mockStudentUser], count: 1 });
      }

      if (url.includes('/admin/audit-logs')) {
        return Promise.resolve({ success: true, logs: mockAuditLogs });
      }

      if (url.includes('/admin/claims') && (method === 'put' || method === 'post')) {
        return Promise.resolve({ success: true, message: 'Claim processed via ACID transaction (Cloud Showcase Mode).' });
      }

      if (url.includes('/admin/items') && method === 'put') {
        return Promise.resolve({ success: true, message: 'Item status updated (Cloud Showcase Mode).' });
      }
    }

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
