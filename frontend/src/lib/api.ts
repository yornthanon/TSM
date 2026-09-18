import type { ApiResponse, PaginatedResponse, LoginRequest, LoginResponse, Project, ContactMessage, ApiError, ApiErrorStats, DashboardStats, CreateProjectRequest, UpdateProjectRequest, ContactFormRequest, ApiMonitorFilters, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-api.onrender.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class ApiClient {
  private token: string | null = null;
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        this.setToken(null);
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
        }
        return {
          data: null as T,
          success: false,
          message: 'Authentication required. Please log in again.',
        };
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          data: data as T,
          success: false,
          message: data.message || `Request failed with status ${response.status}`,
        };
      }

      return {
        data: data as T,
        success: true,
      };
    } catch (error) {
      // Retry on network errors
      if (retryCount < MAX_RETRIES && error instanceof TypeError) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Network error. Please check your connection.',
      };
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Public endpoints
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>('/api/projects');
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  async submitContact(form: ContactFormRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(form),
    });
  }

  // Admin endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/api/admin/dashboard');
  }

  async getAdminProjects(page = 1, pageSize = 10, search?: string, status?: string): Promise<ApiResponse<PaginatedResponse<Project>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return this.request<PaginatedResponse<Project>>(`/api/admin/projects?${params}`);
  }

  async createProject(project: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return this.request<Project>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(project: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/admin/projects/${project.id}`, {
      method: 'PATCH',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getContactMessages(page = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<ContactMessage>>> {
    return this.request<PaginatedResponse<ContactMessage>>(`/api/admin/contacts?page=${page}&pageSize=${pageSize}`);
  }

  async markContactAsRead(id: string): Promise<ApiResponse<ContactMessage>> {
    return this.request<ContactMessage>(`/api/admin/contacts/${id}/read`, {
      method: 'PATCH',
    });
  }

  async deleteContact(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async getApiErrors(filters: ApiMonitorFilters = {}): Promise<ApiResponse<PaginatedResponse<ApiError>>> {
    const params = new URLSearchParams();
    if (filters.statusCode) params.append('statusCode', filters.statusCode.toString());
    if (filters.endpoint) params.append('endpoint', filters.endpoint);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    params.append('page', (filters.page || 1).toString());
    params.append('pageSize', (filters.pageSize || 20).toString());
    return this.request<PaginatedResponse<ApiError>>(`/api/admin/api-errors?${params}`);
  }

  async getApiErrorStats(): Promise<ApiResponse<ApiErrorStats>> {
    return this.request<ApiErrorStats>('/api/admin/api-errors/stats');
  }

  async getApiErrorDetail(id: string): Promise<ApiResponse<ApiError>> {
    return this.request<ApiError>(`/api/admin/api-errors/${id}`);
  }

  // Settings
  async getSettings(): Promise<ApiResponse<{ apiBaseUrl: string }>> {
    return this.request<{ apiBaseUrl: string }>('/api/admin/settings');
  }

  async updateSettings(settings: { apiBaseUrl: string }): Promise<ApiResponse<void>> {
    return this.request<void>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiClient();