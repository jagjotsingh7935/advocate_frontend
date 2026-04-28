import axios from 'axios';

const TAX_API_BASE_URL = 'http://127.0.0.1:8000/'; // Adjust to your Django backend URL

// Axios instance for general use (no timeout for POST)
const taxApi = axios.create({
  baseURL: TAX_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios instance for GET requests with timeout
const taxApiWithTimeout = axios.create({
  baseURL: TAX_API_BASE_URL,
  timeout: 15000, // 15 seconds timeout for GET requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available for both instances
taxApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

taxApiWithTimeout.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTaxMessages = async (options = {}) => {
  try {
    const { params = {} } = options;
    const response = await taxApiWithTimeout.get('/tax-reminder-messages/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch tax messages' };
  }
};

export const sendWhatsAppReminders = async (data) => {
  try {
    const response = await taxApi.post('/send-whatsapp-reminders/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send WhatsApp reminders' };
  }
};