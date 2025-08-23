import axios from 'axios';

// Minimal declaration to satisfy TS when '@types/node' is not installed
declare const process: any;

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
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


