export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived' | 'draft';
  year: number;
  tags: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  errorMessage: string;
  stackTrace?: string;
  requestBody?: unknown;
  responseBody?: unknown;
  userAgent?: string;
  ipAddress?: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalContacts: number;
  apiErrorsCount: number;
  uptime: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ErrorRateData {
  timestamp: string;
  errorRate: number;
  totalRequests: number;
  errorCount: number;
}

export interface StatusCodeDistribution {
  statusCode: number;
  count: number;
  percentage: number;
}

export interface FailingEndpoint {
  endpoint: string;
  method: string;
  errorCount: number;
  errorRate: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  status: Project['status'];
  year: number;
  tags: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
}

export interface SettingsData {
  apiBaseUrl: string;
  profile: {
    name: string;
    role: string;
    bio: string;
  };
  password?: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectFilters extends FilterParams {
  status?: Project['status'];
}

export interface ContactFilters extends FilterParams {
  status?: ContactMessage['status'];
}

export interface ErrorLogFilters extends FilterParams {
  statusCode?: number;
  endpoint?: string;
  method?: string;
}