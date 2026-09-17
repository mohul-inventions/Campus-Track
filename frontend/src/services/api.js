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

function handleMockFallback(url, method, config = {}) {
  const params = config.params || {};

  // 1. Authentication endpoints
  if (url.includes('/auth/login')) {
    let payload = {};
    try {
      payload = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {});
    } catch (e) {}
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

  // 2. Metadata endpoints
  if (url.includes('/meta/categories')) {
    return Promise.resolve({ success: true, count: mockCategories.length, categories: mockCategories });
  }

  if (url.includes('/meta/locations')) {
    return Promise.resolve({ success: true, count: mockLocations.length, locations: mockLocations });
  }

  if (url.includes('/meta/public-stats')) {
    return Promise.resolve({ success: true, stats: mockDashboard.kpis });
  }

  // 3. Lost items endpoints
  if (url.includes('/lost-items')) {
    if (method === 'post') {
      return Promise.resolve({
        success: true,
        message: 'Lost item report filed successfully (Cloud Showcase Mode).',
        lostItem: mockLostItems[0],
        potentialMatchesCount: 1
      });
    }
    // Handle query filters
    let list = [...mockLostItems];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(i =>
        (i.item_name && i.item_name.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        (i.primary_color && i.primary_color.toLowerCase().includes(q))
      );
    }
    if (params.category_id) {
      list = list.filter(i => String(i.category_id) === String(params.category_id));
    }
    if (params.location_id) {
      list = list.filter(i => String(i.location_id) === String(params.location_id));
    }
    if (params.status) {
      list = list.filter(i => i.status.toLowerCase() === params.status.toLowerCase());
    }
    return Promise.resolve({ success: true, count: list.length, items: list });
  }

  // 4. Found items endpoints
  if (url.includes('/found-items')) {
    if (method === 'post') {
      return Promise.resolve({
        success: true,
        message: 'Found item registered successfully (Cloud Showcase Mode).',
        foundItem: mockFoundItems[0],
        potentialMatchesCount: 1
      });
    }
    let list = [...mockFoundItems];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(i =>
        (i.item_name && i.item_name.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        (i.primary_color && i.primary_color.toLowerCase().includes(q))
      );
    }
    if (params.category_id) {
      list = list.filter(i => String(i.category_id) === String(params.category_id));
    }
    if (params.location_id) {
      list = list.filter(i => String(i.location_id) === String(params.location_id));
    }
    if (params.status) {
      list = list.filter(i => i.status.toLowerCase() === params.status.toLowerCase());
    }
    return Promise.resolve({ success: true, count: list.length, items: list });
  }

  // 5. Matches endpoints
  if (url.includes('/matches')) {
    return Promise.resolve({ success: true, count: mockMatches.length, matches: mockMatches });
  }

  // 6. Claims endpoints
  if (url.includes('/claims')) {
    if (method === 'post') {
      return Promise.resolve({
        success: true,
        message: 'Claim #CLM-101 submitted for verification (Cloud Showcase Mode).',
        claim_id: 101
      });
    }
    return Promise.resolve({ success: true, count: mockClaims.length, claims: mockClaims });
  }

  // 7. Admin endpoints
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
    return Promise.resolve({ success: true, students: [mockStudentUser, mockAdminUser], count: 2 });
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

  return Promise.resolve({ success: true, message: 'OK' });
}

// Response Interceptor with Cloud Preview Fallback
api.interceptors.response.use(
  (response) => {
    // When deployed on Vercel without a configured backend, Vercel routes GET API requests to index.html (200 OK)
    const isHtml = typeof response.data === 'string' && (
      response.data.includes('<!DOCTYPE html>') ||
      response.data.includes('<!doctype html>') ||
      response.data.includes('<html')
    );

    if (isHtml) {
      const url = response.config?.url || '';
      const method = (response.config?.method || 'get').toLowerCase();
      return handleMockFallback(url, method, response.config);
    }

    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toLowerCase();

    // When deployed on Vercel without a configured backend, Vercel returns 405 (Method Not Allowed) on POST/PUT
    // or 404 or network failure.
    const isBackendUnavailable = status === 405 || status === 404 || error.code === 'ERR_NETWORK';

    if (isBackendUnavailable) {
      return handleMockFallback(url, method, error.config);
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
