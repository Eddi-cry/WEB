import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://172.20.1.244:8080';

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Храним CSRF токен в памяти
let csrfToken: string | null = null;

// Интерцептор для сохранения CSRF токена из ответа
http.interceptors.response.use(
  (response) => {
    const token = response.headers['x-csrftoken'];
    if (token) {
      csrfToken = token;
      console.log('CSRF Token saved:', csrfToken);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для добавления CSRF токена в запросы
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken;
      console.log('Added CSRF token to request:', csrfToken);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default http;
