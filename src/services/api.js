import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ttwreis_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/'; }
  return Promise.reject(err);
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const applicantService = {
  getProfile: () => api.get('/applicant/profile'),
  getApplication: () => api.get('/applicant/application'),
  submitApplication: (data) => api.post('/applicant/application', data),
  uploadPhoto: (formData) => api.post('/applicant/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadSignature: (formData) => api.post('/applicant/signature', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  initiatePayment: () => api.post('/applicant/payment/initiate'),
  getPaymentStatus: () => api.get('/applicant/payment/status'),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getApplications: (params) => api.get('/admin/applications', { params }),
  getColleges: () => api.get('/admin/colleges'),
  addCollege: (data) => api.post('/admin/colleges', data),
  updateCollege: (id, data) => api.put(`/admin/colleges/${id}`, data),
  deleteCollege: (id) => api.delete(`/admin/colleges/${id}`),
  getExamCenters: () => api.get('/admin/exam-centers'),
  addExamCenter: (data) => api.post('/admin/exam-centers', data),
  updateExamCenter: (id, data) => api.put(`/admin/exam-centers/${id}`, data),
  deleteExamCenter: (id) => api.delete(`/admin/exam-centers/${id}`),
  getInvigilators: () => api.get('/admin/invigilators'),
  addInvigilator: (data) => api.post('/admin/invigilators', data),
  deleteInvigilator: (id) => api.delete(`/admin/invigilators/${id}`),
  getNotifications: () => api.get('/admin/notifications'),
  addNotification: (data) => api.post('/admin/notifications', data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),
};

export const publicService = {
  getNotifications: () => api.get('/public/notifications'),
};

export default api;
