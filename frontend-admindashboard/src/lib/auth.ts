import { api } from './api';
import type { User, LoginCredentials, AuthResponse, ChangePasswordData } from '../types/api';

const USER_KEY = 'user';
const TOKEN_KEY = 'auth_token';

export const auth = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    api.setAuthToken(response.token);
    return response.user;
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    api.setAuthToken(null);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  updateUser: (user: Partial<User>): void => {
    const currentUser = auth.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.post('/auth/change-password', data);
  },
};

export default auth;