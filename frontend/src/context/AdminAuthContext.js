import React, { createContext, useContext, useEffect, useReducer } from 'react';
import api from '../config/api';

const AdminAuthContext = createContext();

const initialState = {
  admin: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADMIN_LOGIN_SUCCESS':
      return { ...state, admin: action.payload, isAuthenticated: true, loading: false, error: null };
    case 'ADMIN_LOGIN_FAILURE':
      return { ...state, admin: null, isAuthenticated: false, loading: false, error: action.payload };
    case 'ADMIN_LOGOUT':
      return { ...state, admin: null, isAuthenticated: false, loading: false, error: null };
    case 'ADMIN_AUTH_CHECKED':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('/api/admin/me');
        if (res.data?.admin) {
          dispatch({ type: 'ADMIN_LOGIN_SUCCESS', payload: res.data.admin });
        } else {
          dispatch({ type: 'ADMIN_AUTH_CHECKED' });
        }
      } catch (e) {
        dispatch({ type: 'ADMIN_AUTH_CHECKED' });
      }
    };
    checkAdmin();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/admin/login', { email, password });
      dispatch({ type: 'ADMIN_LOGIN_SUCCESS', payload: res.data.admin });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'ADMIN_LOGIN_FAILURE', payload: message });
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/admin/logout');
    } finally {
      dispatch({ type: 'ADMIN_LOGOUT' });
    }
  };

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);


