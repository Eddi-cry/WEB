// services/http.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://172.20.1.244:8080';

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cookies будут передаваться автоматически
});

// УБРАТЬ interceptor для ручной установки токена!
// Теперь токены автоматически в cookies

export default http;
