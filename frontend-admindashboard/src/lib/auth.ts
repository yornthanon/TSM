import { api } from './api';
import type { User, OAuthCodeExchangeResponse } from '../types/api';

const USER_KEY = 'user';
const TOKEN_KEY = 'auth_token';

function appRole(roles: string[] | null | undefined): User['role'] {
  if (roles?.includes('ADMIN')) return 'ADMIN';
  if (roles?.includes('TENANT_ADMIN')) return 'TENANT_ADMIN';
  return 'USER';
}

export const auth = {
  startGoogleSignIn: (): void => {
    auth.logout();
    window.location.assign(`${api.getApiOrigin()}/oauth2/authorization/google`);
  },

  completeGoogleSignIn: async (code: string, totpCode?: string): Promise<User> => {
    const response = await api.post<OAuthCodeExchangeResponse>('/auth/oauth/exchange', {
      code,
      ...(totpCode ? { totpCode } : {}),
    });

    if (!response?.access_token || !response.username) {
      throw new Error('Google sign-in succeeded but the server did not return a valid session.');
    }

    localStorage.setItem(TOKEN_KEY, response.access_token);
    api.setAuthToken(response.access_token);

    try {
      const backendUser = await api.get<User>('/users/me');
      const user: User = {
        ...backendUser,
        role: appRole(backendUser.roles),
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

};

export default auth;
