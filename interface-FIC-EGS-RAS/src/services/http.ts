import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://172.20.1.244:8080';

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Функция для получения CSRF токена из cookies
function getCSRFTokenFromCookie(): string | null {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length);
    }
  }
  return null;
}

// Interceptor для автоматической установки CSRF токена
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Для ВСЕХ запросов (включая GET) получаем CSRF токен
    const csrfToken = getCSRFTokenFromCookie();
    
    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken;
      config.headers['X-CSRF-Token'] = csrfToken; // Дублируем на всякий случай
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
