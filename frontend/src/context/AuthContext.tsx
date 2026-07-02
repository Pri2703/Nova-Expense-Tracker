import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to refresh token on boot to see if session exists
        const { data } = await api.post('/api/auth/refresh', {}, { withCredentials: true });
        setAccessToken(data.accessToken);

        // Retrieve user details
        const profileRes = await api.get('/api/auth/me');
        setUser(profileRes.data);
      } catch (error) {
        console.log('Session initialization failed (user not logged in).');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for custom API logout event
    const handleForceLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth-logout', handleForceLogout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setAccessToken(data.accessToken);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        currency: data.currency,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      setAccessToken(data.accessToken);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        currency: data.currency,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } as User : null));
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
