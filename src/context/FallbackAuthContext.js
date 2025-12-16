import React, { createContext, useContext, useState } from 'react';

// Fallback AuthContext for when backend is not available
const FallbackAuthContext = createContext();

export const FallbackAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      // Mock login for development
      const mockUser = {
        id: '1',
        firstName: 'Demo',
        lastName: 'User',
        email: credentials.email,
        avatar: null,
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, user: mockUser };
    } catch (err) {
      setError('Login failed');
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      // Mock registration for development
      const mockUser = {
        id: '1',
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        avatar: null,
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, user: mockUser };
    } catch (err) {
      setError('Registration failed');
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    sendOTP: async () => ({ success: true }),
    verifyOTP: async () => ({ success: true }),
    forgotPassword: async () => ({ success: true }),
    resetPassword: async () => ({ success: true }),
    updateProfile: async () => ({ success: true, user }),
    changePassword: async () => ({ success: true }),
    uploadAvatar: async () => ({ success: true, user }),
    clearError: () => setError(null),
  };

  return (
    <FallbackAuthContext.Provider value={value}>
      {children}
    </FallbackAuthContext.Provider>
  );
};

export const useFallbackAuth = () => {
  const context = useContext(FallbackAuthContext);
  if (!context) {
    throw new Error('useFallbackAuth must be used within a FallbackAuthProvider');
  }
  return context;
};

export default FallbackAuthContext;
