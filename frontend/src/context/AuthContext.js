import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'AUTH_CHECKED':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        error: null
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    axios.defaults.withCredentials = true;
  }, []);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        if (response.data.success) {
          dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
        } else {
          // Silently mark auth as checked without surfacing an error on public routes
          dispatch({ type: 'AUTH_CHECKED' });
        }
      } catch (error) {
        // No token or a 401 should not show a global error on public pages
        dispatch({ type: 'AUTH_CHECKED' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password, role) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        role
      });

      if (response.data.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await axios.post('/api/auth/register', userData);

      if (response.data.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const role = state.user?.role;
      let endpoint = '/api/auth/profile';
      if (role === 'student') {
        endpoint = '/api/student/profile';
      } else if (role === 'recruiter') {
        endpoint = '/api/recruiter/profile';
      }

      const response = await axios.put(endpoint, profileData);
      if (response.data.success) {
        dispatch({ type: 'UPDATE_USER', payload: response.data.user });
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return { success: false, message: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
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
