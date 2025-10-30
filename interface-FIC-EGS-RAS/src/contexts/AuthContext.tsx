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

  // Функция логина
  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    setUserStatus(data.user_status);
  };

  // Функция логаута - УПРОЩЕННАЯ
  const logout = () => {
    authService.logout();
  };

  // Автоматическое обновление токена
  useEffect(() => {
    const REFRESH_INTERVAL = 1000 * 60 * 50; // 50 минут

    let interval: NodeJS.Timeout;

    if (user) {
      // Устанавливаем периодическое обновление
      interval = setInterval(() => {
        authService.refreshToken().catch(() => logout());
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

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
