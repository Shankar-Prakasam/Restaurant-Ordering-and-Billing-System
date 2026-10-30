import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every outgoing request if present
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

// Global response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired, clear and optionally redirect
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const menuService = {
  getItems: (params) => api.get('/menu', { params }),
  getItemById: (id) => api.get(`/menu/${id}`),
  createItem: (data) => api.post('/menu', data),
  updateItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteItem: (id) => api.delete(`/menu/${id}`),
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const tableService = {
  getTables: (params) => api.get('/tables', { params }),
  getAvailableTables: (params) => api.get('/tables/available', { params }),
  getTableById: (id) => api.get(`/tables/${id}`),
  createTable: (data) => api.post('/tables', data),
  updateTable: (id, data) => api.put(`/tables/${id}`, data),
  deleteTable: (id) => api.delete(`/tables/${id}`),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  getQrCode: (id) => api.get(`/bookings/${id}/qr`),
};

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { orderStatus: status }),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
};

export const billService = {
  generateBill: (data) => api.post('/bills/generate', data),
  getBills: (params) => api.get('/bills', { params }),
  getBillById: (id) => api.get(`/bills/${id}`),
};

export const paymentService = {
  recordPayment: (data) => api.post('/payments', data),
  getPayments: (params) => api.get('/payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
};

export const reportService = {
  getDashboardSummary: () => api.get('/reports/dashboard'),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getPopularDishes: () => api.get('/reports/popular-dishes'),
  getBookingsReport: (params) => api.get('/reports/bookings', { params }),
  getOrdersReport: (params) => api.get('/reports/orders', { params }),
};

export const qrService = {
  verifyToken: (token) => api.get(`/qr/verify/${token}`),
};

export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
