import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE ? `${process.env.REACT_APP_API_BASE}/api` : 'http://127.0.0.1:8000/api';

// Create axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => API.post('/users/register/', userData),
  login: (credentials) => API.post('/users/login/', credentials),
  logout: () => API.post('/users/logout/'),
  getProfile: () => API.get('/users/profile/'),
  updateProfile: (userData) => API.put('/users/profile/', userData),
};

// Shop API
export const shopAPI = {
  getShops: () => API.get('/shops/'),
  getShop: (id) => API.get(`/shops/${id}/`),
  createShop: (shopData) => API.post('/shops/', shopData),
  updateShop: (id, shopData) => API.put(`/shops/${id}/`, shopData),
  payJoinFee: (shopId) => API.post(`/shops/${shopId}/join-payment/`),
  verifyShop: (shopId) => API.post(`/shops/${shopId}/verify/`),
  getShopComments: (shopId) => API.get(`/shops/${shopId}/comments/`),
  addShopComment: (shopId, commentData) => API.post(`/shops/${shopId}/comments/`, commentData),
};

// Product API
export const productAPI = {
  getProducts: (params) => API.get('/products/', { params }),
  getProduct: (id) => API.get(`/products/${id}/`),
  createProduct: (productData) => API.post('/products/', productData),
  updateProduct: (id, productData) => API.put(`/products/${id}/`, productData),
  deleteProduct: (id) => API.delete(`/products/${id}/`),
  getProductInquiries: (productId) => API.get(`/products/${productId}/inquiries/`),
  createProductInquiry: (productId, inquiryData) => API.post(`/products/${productId}/inquiries/`, inquiryData),
};

// Order API
export const orderAPI = {
  getOrders: (params) => API.get('/orders/', { params }),
  getOrder: (id) => API.get(`/orders/${id}/`),
  createOrder: (orderData) => API.post('/orders/', orderData),
  updateOrder: (id, orderData) => API.put(`/orders/${id}/`, orderData),
  cancelOrder: (id) => API.post(`/orders/${id}/cancel/`),
  fulfillOrder: (id) => API.post(`/orders/${id}/fulfill/`),
};

// Chat API
export const chatAPI = {
  getChatHistory: (orderId) => API.get(`/chat/conversations/order/${orderId}/`),
  sendMessage: (orderId, messageData) => API.post(`/chat/orders/${orderId}/start-chat/`, messageData),
  getConversations: () => API.get('/chat/conversations/'),
};

export default API;

