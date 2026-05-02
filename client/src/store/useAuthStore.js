import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('replog_token') || null,
  isAuthenticated: false, // Default to false until the server verifies it
  isLoading: false,
  isCheckingAuth: true,   // Critical: Start true to prevent premature redirects

  register: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.register(credentials);
      const { token, ...userData } = res.data.data;
      
      localStorage.setItem('replog_token', token);
      set({ user: userData, token, isAuthenticated: true, isLoading: false });
      
      toast.success('Welcome to RepLog! Let\'s crush it. 🔥', {
        style: { background: '#181818', color: '#22c55e', border: '1px solid #22c55e' }
      });
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.login(credentials);
      const { token, ...userData } = res.data.data;
      
      localStorage.setItem('replog_token', token);
      set({ user: userData, token, isAuthenticated: true, isLoading: false });
      
      toast.success('Welcome back!', {
        style: { background: '#181818', color: '#f5f5f5', border: '1px solid #2a2a2a' }
      });
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Invalid credentials');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('replog_token');
    set({ user: null, token: null, isAuthenticated: false });
    toast('Logged out successfully', { icon: '👋' });
  },

  // Replaces fetchProfile: Verifies the token with the backend on app load
  checkAuth: async () => {
    const token = localStorage.getItem('replog_token');
    if (!token) {
      set({ isCheckingAuth: false, isAuthenticated: false });
      return;
    }

    try {
      const res = await authAPI.getProfile();
      set({ user: res.data.data, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      // Token is invalid/expired
      localStorage.removeItem('replog_token');
      set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false });
    }
  }
}));

export default useAuthStore;