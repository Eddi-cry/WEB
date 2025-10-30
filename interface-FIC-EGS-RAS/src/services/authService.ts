// services/authService.ts
import http from './http';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: string;
  user_status: string;
}

export interface RegisterRequest {
  email: string;
  user_name: string;
  organization: string;
  password: string;
  password2: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    email: string;
    user_name: string;
    organization: string;
    start_date: string;
    is_staff: boolean;
    is_active: boolean;
  };
}

class AuthService {
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    http.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && error.response.data?.detail?.includes('CSRF')) {
          // Если CSRF ошибка - получаем новый токен и повторяем запрос
          await this.ensureCSRFToken();
          return http(originalRequest);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.failedQueue.push({ resolve });
            }).then(() => {
              return http(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            const retryResponse = await http(originalRequest);
            this.failedQueue.forEach(({ resolve }) => resolve());
            this.failedQueue = [];
            return retryResponse;
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            this.logout();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Новый метод для гарантированного получения CSRF токена
  async ensureCSRFToken(): Promise<void> {
    try {
      await http.get('/api/users/csrf/');
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    // Гарантируем что CSRF токен получен перед логином
    await this.ensureCSRFToken();
    
    const { data } = await http.post<LoginResponse>('/api/users/token/', payload);

    localStorage.setItem('username', JSON.stringify(data.user));
    localStorage.setItem('userStatus', JSON.stringify(data.user_status));

    return data;
  }

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    await this.ensureCSRFToken();
    const { data } = await http.post<RegisterResponse>('/api/users/register/', payload);
    return data;
  }

  async refreshToken(): Promise<void> {
    await http.post('/api/users/token/refresh/');
  }

  async getProfile() {
    const { data } = await http.get('/api/users/me/');
    return data;
  }

  logout(): void {
    localStorage.removeItem('username');
    localStorage.removeItem('userStatus');
    this.clearAuthCookies();
    delete http.defaults.headers.common['X-CSRFToken'];
    window.location.href = '/Login';
  }

  private clearAuthCookies(): void {
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      if (name === 'access_token' || name === 'refresh_token' || name === 'csrftoken') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=172.20.1.244;`;
      }
    }

    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('username');
  }

  getCurrentUser(): string | null {
    const user = localStorage.getItem('username');
    return user ? JSON.parse(user) : null;
  }
}

export default new AuthService();
