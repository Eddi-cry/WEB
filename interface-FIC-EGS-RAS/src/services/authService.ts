import http from './http';

export interface RegisterRequest {
  email: string;
  user_name: string;
  last_name: string;
  first_name: string;
  patronymic: string;
  phone: string;
  organization: string;
  department: string;
  position: string;
  password: string;
  password2: string;
}

export interface RegisterResponseUser {
  email: string;
  user_name: string;
  organization: string;
  start_date: string;
  is_staff: boolean;
  is_active: boolean;
}

export interface RegisterResponse {
  message: string;
  user: RegisterResponseUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseUser {
  email: string;
  user_name: string;
  organization: string;
  is_active: boolean;
  is_staff: boolean;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: LoginResponseUser;
}

function setAccessToken(token: string) {
  localStorage.setItem('access', token);
}

function setRefreshCookie(token: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 7;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `refresh=${token}; Path=/; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

function getRefreshCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )refresh=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function clearAuth() {
  localStorage.removeItem('access');
  localStorage.removeItem('user');
  document.cookie = 'refresh=; Path=/; Max-Age=0';
}

async function register(payload: RegisterRequest) {
  const { data } = await http.post<RegisterResponse>('/api/users/register/', payload);
  return data;
}

async function login(payload: LoginRequest) {
  const { data } = await http.post<LoginResponse>('/api/users/token/', payload);
  setAccessToken(data.access);
  setRefreshCookie(data.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshCookie();
  if (!refresh) return null;
  try {
    const { data } = await http.post<{ access: string }>('/api/users/token/refresh/', { refresh });
    setAccessToken(data.access);
    return data.access;
  } catch {
    clearAuth();
    return null;
  }
}

function getStoredUser(): LoginResponseUser | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default {
  register,
  login,
  refreshAccessToken,
  clearAuth,
  getStoredUser,
};
