import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import { getApiErrorMessage } from '../api/apiError';

const normalizeStoredUser = (raw) => {
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (!user) return null;
    const ws = user.activeWorkspace;
    const workspaceId = ws?._id ?? ws;
    return workspaceId ? { ...user, activeWorkspace: String(workspaceId) } : user;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: normalizeStoredUser(localStorage.getItem('user')),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (user.activeWorkspace) {
        localStorage.setItem('activeWorkspace', user.activeWorkspace);
      }
    }
    set({ user });
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response.data;
      const workspaceId = user.activeWorkspace?._id ?? user.activeWorkspace;

      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({ ...user, activeWorkspace: workspaceId }));
      if (workspaceId) localStorage.setItem('activeWorkspace', String(workspaceId));

      set({
        user: { ...user, activeWorkspace: workspaceId },
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ error: getApiErrorMessage(error, 'Login failed'), isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      const { user, accessToken, refreshToken } = response.data;
      const workspaceId = user.activeWorkspace?._id ?? user.activeWorkspace;

      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({ ...user, activeWorkspace: workspaceId }));
      if (workspaceId) localStorage.setItem('activeWorkspace', String(workspaceId));

      set({
        user: { ...user, activeWorkspace: workspaceId },
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ error: getApiErrorMessage(error, 'Registration failed'), isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('activeWorkspace');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
