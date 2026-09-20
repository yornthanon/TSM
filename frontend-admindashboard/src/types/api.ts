export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  year: number;
  tags: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'draft' | 'published' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export type ContactStatus = 'unread' | 'read' | 'replied';

export interface ApiError {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  errorMessage: string;
  stackTrace?: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  userAgent?: string;
  ipAddress?: string;
  resolved: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalContacts: number;
  apiErrorsCount: number;
  uptime: number;
}

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'project_updated' | 'contact_received' | 'api_error';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ErrorStats {
  errorRate: number;
  totalRequests: number;
  failedRequests: number;
  mostFailingEndpoints: Array<{ endpoint: string; count: number }>;
  statusCodeDistribution: Record<number, number>;
}

export interface ApiConfig {
  baseUrl: string;
}