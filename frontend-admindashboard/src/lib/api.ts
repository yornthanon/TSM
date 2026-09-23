import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiErrorResponse } from '../types/api';

// VITE_API_BASE_URL is the documented deployment variable. Keep VITE_API_URL
// as a backwards-compatible alias, and avoid calling localhost from a hosted
// browser when neither variable is configured.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private retryCount = 0;
  private maxRetries = 3;

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

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        const data = response.data as Record<string, unknown> | undefined;
        if (data && typeof data === 'object' && 'is_error' in data && (data as { is_error: boolean }).is_error) {
          const message = (data as { message?: string }).message || 'An error occurred';
          return Promise.reject(new Error(message));
        }
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        if (
          (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) &&
          this.retryCount < this.maxRetries &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          this.retryCount++;
          await this.delay(1000 * this.retryCount);
          return this.client(originalRequest);
        }

        this.retryCount = 0;
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: AxiosError<ApiErrorResponse>): Error {
    if (error.response?.data) {
      const apiError = error.response.data;
      if (typeof apiError === 'object' && apiError !== null && 'message' in apiError) {
        return new Error((apiError as { message?: string }).message || 'An error occurred');
      }
      return new Error(JSON.stringify(apiError));
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    const data = response.data as Record<string, unknown>;
    return data.data as T;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    const responseData = response.data as Record<string, unknown>;
    return responseData.data as T;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    const responseData = response.data as Record<string, unknown>;
    return responseData.data as T;
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    const responseData = response.data as Record<string, unknown>;
    return responseData.data as T;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    const responseData = response.data as Record<string, unknown>;
    return responseData.data as T;
  }

  public setAuthToken(token: string | null): void {
    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common.Authorization;
    }
  }

  public getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const api = new ApiClient();
export default api;
