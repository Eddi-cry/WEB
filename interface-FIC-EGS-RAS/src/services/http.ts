import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://172.20.1.244:8080';

function getAccessToken(): string | null {
  try {
    return localStorage.getItem('access');
  } catch {
    return null;
  }
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default http;
