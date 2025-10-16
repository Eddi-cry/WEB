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

  async login(payload: LoginRequest): Promise<LoginResponse> {
    await this.getCSRF();
    const { data } = await http.post<LoginResponse>('/api/users/token/', payload);
    
    // Сохраняем пользователя в localStorage
    localStorage.setItem('username', JSON.stringify(data.user));
    localStorage.setItem('userStatus', JSON.stringify(data.user_status));
    
    return data;
  }

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    await this.getCSRF();
    const { data } = await http.post<RegisterResponse>('/api/users/register/', payload);
    return data;
  }

  async refreshToken(): Promise<void> {
    await this.getCSRF();
    await http.post('/api/users/token/refresh/');
  }

  async getCSRF(): Promise<string> {
    const response = await http.get('/api/users/csrf/');
    const csrfToken = response.headers['x-csrftoken'];
    http.defaults.headers.common['X-CSRFToken'] = csrfToken;
    return csrfToken;
  }

  async getProfile() {
    const { data } = await http.get('/api/users/me/');
    return data;
  }

  logout(): void {
    localStorage.removeItem('username');
    localStorage.removeItem('userStatus');
    delete http.defaults.headers.common['X-CSRFToken'];
    window.location.href = '/Login';
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
