import { api } from './api';
import type { ActAsResponse, User, OAuthCodeExchangeResponse } from '../types/api';

const USER_KEY = 'user';
const TOKEN_KEY = 'auth_token';
const ACT_AS_TOKEN_KEY = 'act_as_token';
const ACT_AS_USER_KEY = 'act_as_user';
const ACT_AS_SESSION_KEY = 'act_as_session_id';
const ACT_AS_EXPIRY_KEY = 'act_as_expires_at';

function appRole(roles: string[] | null | undefined): User['role'] {
  const normalizedRoles = new Set(
    (roles ?? []).map((role) => role.trim().toUpperCase().replace(/^ROLE_/, '')),
  );
  if (normalizedRoles.has('ADMIN')) return 'ADMIN';
  if (normalizedRoles.has('TENANT_ADMIN')) return 'TENANT_ADMIN';
  return 'USER';
}

function clearActAsStorage(): void {
  localStorage.removeItem(ACT_AS_TOKEN_KEY);
  localStorage.removeItem(ACT_AS_USER_KEY);
  localStorage.removeItem(ACT_AS_SESSION_KEY);
  localStorage.removeItem(ACT_AS_EXPIRY_KEY);
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

    clearActAsStorage();
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

  beginActAs: (response: ActAsResponse): User => {
    if (!localStorage.getItem(TOKEN_KEY)) throw new Error('The CEO session is no longer available. Sign in again.');
    if (!response?.accessToken || !response.target || !response.sessionId) {
      throw new Error('The server did not return a valid act-as session.');
    }
    const target: User = {
      id: response.target.id,
      username: response.target.username,
      email: response.target.email,
      firstName: response.target.firstName,
      lastName: response.target.lastName,
      tenantId: response.target.tenantId,
      roles: response.target.roles,
      role: appRole(response.target.roles),
    } as User;
    localStorage.setItem(ACT_AS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(ACT_AS_USER_KEY, JSON.stringify(target));
    localStorage.setItem(ACT_AS_SESSION_KEY, String(response.sessionId));
    localStorage.setItem(ACT_AS_EXPIRY_KEY, response.expiresAt);
    return target;
  },

  endActAs: (): void => {
    clearActAsStorage();
    api.setAuthToken(localStorage.getItem(TOKEN_KEY));
    window.dispatchEvent(new CustomEvent('ticketdesk-act-as-ended'));
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearActAsStorage();
    api.setAuthToken(null);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(ACT_AS_USER_KEY) || localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getAdminToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getActAsToken: (): string | null => localStorage.getItem(ACT_AS_TOKEN_KEY),
  getActAsSessionId: (): string | null => localStorage.getItem(ACT_AS_SESSION_KEY),
  getActAsExpiry: (): string | null => localStorage.getItem(ACT_AS_EXPIRY_KEY),
  isActingAs: (): boolean => Boolean(localStorage.getItem(ACT_AS_TOKEN_KEY) && localStorage.getItem(ACT_AS_SESSION_KEY)),
  isAuthenticated: (): boolean => Boolean(localStorage.getItem(TOKEN_KEY)),

  updateUser: (user: Partial<User>): void => {
    const currentUser = auth.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      const key = auth.isActingAs() ? ACT_AS_USER_KEY : USER_KEY;
      localStorage.setItem(key, JSON.stringify(updatedUser));
    }
  },
};

export default auth;
