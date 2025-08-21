import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try { localStorage.removeItem('token'); } catch {}
      try { window?.location?.assign?.('/auth'); } catch {}
    }
    return Promise.reject(err);
  }
);

export default api;


