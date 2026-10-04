import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusfind_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(
    () => localStorage.getItem('campusfind_token')
  );
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('campusfind_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout(false);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (studentIdOrEmail, password) => {
    try {
      const res = await API.post('/auth/login', {
        loginIdentifier: studentIdOrEmail,
        identifier: studentIdOrEmail,
        email: studentIdOrEmail,
        studentId: studentIdOrEmail,
        password,
      });
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('campusfind_token', jwtToken);
      localStorage.setItem('campusfind_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      success(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.message === 'Network Error' || !err.response) {
          msg = 'Network connection issue to campus server. Please retry in a moment.';
        } else {
          msg = 'Invalid Student ID/Email or password';
        }
      }
      toastError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (registerData) => {
    try {
      const res = await API.post('/auth/register', registerData);
      const { token: jwtToken, user: userData } = res.data;
      if (jwtToken && (userData.status === 'APPROVED' || userData.status === 'ACTIVE')) {
        localStorage.setItem('campusfind_token', jwtToken);
        localStorage.setItem('campusfind_user', JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);
        success('Student account registered and logged in!');
      } else {
        success('Registration submitted! Awaiting administrator approval.');
      }
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      toastError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = (showToast = true) => {
    localStorage.removeItem('campusfind_token');
    localStorage.removeItem('campusfind_user');
    setToken(null);
    setUser(null);
    if (showToast) {
      success('Logged out successfully.');
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await API.get('/users/profile');
      setUser(res.data);
      localStorage.setItem('campusfind_user', JSON.stringify(res.data));
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT' || user?.role === 'USER',
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
