import { api } from './api';
import type { User, LoginCredentials } from '../types/api';

const USER_KEY = 'user';
const TOKEN_KEY = 'auth_token';

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const auth = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post<{ access_token: string; refresh_token: string }>('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });

    if (!response?.access_token) {
      throw new Error('Login succeeded but the server did not return an access token');
    }

    localStorage.setItem(TOKEN_KEY, response.access_token);
    api.setAuthToken(response.access_token);

    try {
      let backendUser: User;
      try {
        backendUser = await api.get<User>(`/users/email/${encodeURIComponent(credentials.username)}`);
      } catch {
        // Preserve compatibility with accounts that log in using their username.
        backendUser = await api.get<User>(`/users/username/${encodeURIComponent(credentials.username)}`);
      }
      const user: User = {
        ...backendUser,
        role: backendUser.userType || 'AGENT',
      };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      auth.logout();
      throw error;
    }
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
    const user = auth.getUser();
    if (!user) throw new Error('Not authenticated');
    await api.put(`/users/${user.id}/change-password`, undefined, {
      params: { oldPassword: data.oldPassword, newPassword: data.newPassword },
    });
  },
};

export default auth;
