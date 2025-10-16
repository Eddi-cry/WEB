// src/contexts/AuthContextx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService from '../services/authService';

interface AuthContextType {
  user: string | null;
  userStatus: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<string | null>(() => 
    localStorage.getItem('username') 
      ? JSON.parse(localStorage.getItem('username')!) 
      : null
  );
  const [userStatus, setUserStatus] = useState<string | null>(() => 
    localStorage.getItem('userStatus') 
      ? JSON.parse(localStorage.getItem('userStatus')!) 
      : null
  );

  // Функция для проверки и обновления токена
  const refreshToken = async () => {
    try {
      await authService.refreshToken();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  // Функция логина
  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    setUserStatus(data.user_status);
    localStorage.setItem('username', JSON.stringify(data.user));
    localStorage.setItem('userStatus', JSON.stringify(data.user_status));
  };

  // Функция логаута
  const logout = () => {
    authService.logout();
    setUser(null);
    setUserStatus(null);
    localStorage.removeItem('username');
    localStorage.removeItem('userStatus');
  };

  // Автоматическое обновление токена
  useEffect(() => {
    const REFRESH_INTERVAL = 1000 * 60 * 50; // 50 минут (обновляем до истечения 60 минут)
    
    let interval: NodeJS.Timeout;
    
    if (user) {
      // Сразу проверяем при монтировании
      refreshToken();
      
      // Устанавливаем периодическое обновление
      interval = setInterval(refreshToken, REFRESH_INTERVAL);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      if (user && !localStorage.getItem('username')) {
        // Если в состоянии есть пользователь, но в localStorage нет - синхронизируем
        localStorage.setItem('username', JSON.stringify(user));
        localStorage.setItem('userStatus', JSON.stringify(userStatus));
      }
    };
    
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    userStatus,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
