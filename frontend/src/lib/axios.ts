import axios, { AxiosHeaders } from 'axios';

// Minimal declaration to satisfy TS when '@types/node' is not installed
declare const process: any;

const baseURL =
  (process?.env?.REACT_APP_API_URL) ||
  (process?.env?.REACT_APP_BACKEND_URL) ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
    }
  } catch {}
  return config;
});

export default api;


