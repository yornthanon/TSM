import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiErrorResponse } from '../types/api';

/**
 * Single source of truth for the backend location.
 *
 * VITE_API_BASE_URL must be the *API root*, i.e. it has to end in `/api/v1`
 * because every endpoint below is registered under that prefix. A value such as
 * `http://localhost:8080` would make `api.post('/auth/login')` resolve to
 * `/auth/login`, which no controller exposes.
 *
 * When unset the app falls back to the same-origin relative path so a reverse
 * proxy can serve both the SPA and the API from one host.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

/** Prefix every backend route below this root, so hooks never repeat `/api/v1`. */
export const API_ROOT = '/api/v1';

/** Backend origin with the API prefix stripped, resolved once at startup. */
function apiOrigin(): string {
  if (API_BASE_URL.startsWith('/')) return ''; // same-origin reverse proxy
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL;
  }
}

class ApiClient {
  private client: AxiosInstance;
  private originClient: AxiosInstance;
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

    this.originClient = axios.create({
      baseURL: apiOrigin(),
      timeout: 10000,
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
          const failure = new Error(message) as Error & { code?: string };
          const code = (data as { code?: unknown }).code;
          if (typeof code === 'string') failure.code = code;
          return Promise.reject(failure);
        }
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.hash = '#/login';
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
        const failure = new Error((apiError as { message?: string }).message || 'An error occurred') as Error & { code?: string };
        const code = (apiError as { code?: unknown }).code;
        if (typeof code === 'string') failure.code = code;
        return failure;
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

  /**
   * Returns the whole response body instead of unwrapping `data`.
   *
   * Needed for endpoints that are not wrapped in the `ResponseErrorTemplate`
   * envelope, such as Spring's `/actuator/health`.
   */
  public async getRaw<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(path, config);
    return response.data as T;
  }

  /**
   * Calls a path against the backend *origin* rather than the `/api/v1` root.
   *
   * Actuator is exposed by the monolith at `/actuator/health`, outside the API
   * prefix - requesting `/api/v1/actuator/health` returns a 500 error envelope.
   */
  public async getFromOrigin<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.originClient.get(path, config);
    return response.data as T;
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

  /** Resolved backend root, surfaced by the connection diagnostics screen. */
  public getBaseUrl(): string {
    return API_BASE_URL;
  }

  /** Backend origin with the route prefix stripped, for human-readable display. */
  public getApiOrigin(): string {
    return apiOrigin() || window.location.origin;
  }
}

export const api = new ApiClient();
export default api;
