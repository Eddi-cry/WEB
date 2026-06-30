import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService, { type LoginResponseUser } from '@services/authService.ts';

interface AuthContextType {
  user: LoginResponseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: LoginResponseUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = authService.getStoredUser();
      const accessToken = localStorage.getItem('access');

      if (accessToken && storedUser) {
        setUser(storedUser);
      } else {
        const newToken = await authService.refreshAccessToken();
        if (newToken && storedUser) {
          setUser(storedUser);
        } else {
          authService.clearAuth();
        }
      }

      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const logout = () => {
    authService.clearAuth();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
