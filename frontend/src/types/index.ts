// Type definitions for the portfolio application

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  year: number;
  tags: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export interface ApiError {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  errorMessage: string;
  stackTrace?: string;
  requestBody?: string;
  responseBody?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApiErrorStats {
  totalErrors: number;
  errorRate: number;
  errorsByStatusCode: Record<number, number>;
  errorsByEndpoint: Record<string, number>;
  mostFailingEndpoints: Array<{ endpoint: string; count: number }>;
  statusCodeDistribution: Array<{ code: number; count: number; percentage: number }>;
}

export interface DashboardStats {
  totalProjects: number;
  totalContacts: number;
  totalApiErrors: number;
  uptime: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'project_updated' | 'contact_received' | 'api_error';
  title: string;
  description: string;
  timestamp: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  status: Project['status'];
  year: number;
  tags: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export interface ContactFormRequest {
  name: string;
  email: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiMonitorFilters {
  statusCode?: number;
  endpoint?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}