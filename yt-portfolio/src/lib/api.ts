import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, LoginRequest, LoginResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const token = await this.refreshToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.client(originalRequest);
          } catch {
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }

        if (error.response?.status === 403) {
          this.clearAuth();
          window.location.href = '/login';
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const { token } = response.data.data;
      
      localStorage.setItem('auth_token', token);
      return token;
    })();

    try {
      return await this.refreshTokenPromise;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private formatError(error: AxiosError): Error & { status?: number; code?: string } {
    const message = (error.response?.data as { error?: { message?: string } })?.error?.message 
      || error.message 
      || 'An unexpected error occurred';
    
    const formattedError = new Error(message) as Error & { status?: number; code?: string };
    formattedError.status = error.response?.status;
    formattedError.code = (error.response?.data as { error?: { code?: string } })?.error?.code;
    return formattedError;
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data as T;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data as T;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const { token, user } = response.data.data!;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
}

export const api = new ApiClient();