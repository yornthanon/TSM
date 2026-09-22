export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType?: string;
  gender?: string;
  dateOfBirth?: string;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER';

export interface Ticket {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  customerName: string;
  customerEmail: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  tags: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'review' | 'resolved' | 'closed';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  content: string;
  mentions: string[];
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  ticketId: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TicketStats {
  totalTickets: number;
  pendingTickets: number;
  solvedTickets: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  ticketsByStatus: Record<TicketStatus, number>;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByCategory: Record<string, number>;
  recentTrend: Array<{ date: string; count: number }>;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
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

export interface ApiError {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  statusCode: number;
  errorMessage: string;
  stackTrace?: string;
  resolved: boolean;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  customerName: string;
  customerEmail: string;
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  status?: TicketStatus;
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assigneeId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CommentData {
  content: string;
  mentions?: string[];
}

export interface Settings {
  apiBaseUrl: string;
  profile: {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
  };
}
