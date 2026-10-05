/**
 * Domain types for the event ticketing platform.
 *
 * Every shape here is mirrored from a real backend DTO. The backend returns
 * snake_case for a few audit fields on Role only, so those are named as the
 * server names them rather than being silently renamed.
 *
 * Note on envelopes: the api client unwraps `ResponseErrorTemplate.data`, so
 * these types describe the *payload*, not the wrapper.
 */

// ---------------------------------------------------------------------------
// Enums - mirrors of the backend Java enums
// ---------------------------------------------------------------------------

export const EVENT_STATUSES = [
  'DRAFT',
  'UPCOMING',
  'ACTIVE',
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
  'POSTPONED',
  'RESCHEDULED',
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_TYPES = [
  'CONCERT',
  'MOVIE_THEATER',
  'SPORTS',
  'CONFERENCE',
  'WORKSHOP',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const TICKET_STATUSES = [
  'AVAILABLE',
  'LOCKED',
  'SOLD',
  'CANCELLED',
  'EXPIRED',
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_TYPES = ['STANDARD', 'VIP', 'PREMIUM'] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'PAYPAL',
  'BANK_TRANSFER',
  'CASH',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const NOTIFICATION_STATUSES = ['PENDING', 'SENT', 'FAILED', 'RETRY'] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export const NOTIFICATION_TYPES = ['EMAIL', 'SMS', 'PUSH_NOTIFICATION'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Application roles resolved from the verified backend principal. */
export type AppRole = 'ADMIN' | 'TENANT_ADMIN' | 'USER';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Event {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  /** LocalDateTime, serialised without a zone suffix. */
  eventDate: string | null;
  basePrice: number | null;
  capacity: number | null;
  eventType: EventType | null;
  /** Null until an admin sets one - the backend does not default it. */
  status: EventStatus | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface Ticket {
  id: number;
  eventId: number;
  seatNumber: string;
  price: number;
  ticketStatus: TicketStatus | null;
  ticketType: TicketType | null;
  lockedBy: string | null;
  lockedUntil: string | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface Order {
  id: number;
  eventId: number;
  ticketId: number;
  quantity: number;
  amount: number;
  orderStatus: OrderStatus | null;
  /** Serialised as a string even though the column is numeric. */
  paymentId: string | number | null;
  orderDate: string | null;
  username?: string | null;
}

export interface Payment {
  paymentId: number | null;
  orderId: number;
  transactionId: string | null;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus | null;
  paymentDate: string | null;
}

export interface Notification {
  id: number;
  username: string | null;
  orderId: number | null;
  eventType: string | null;
  notificationType: NotificationType | null;
  recipient: string | null;
  subject: string | null;
  message: string | null;
  status: NotificationStatus | null;
}

export interface User {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  userImg: string | null;
  email: string | null;
  userType: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  lastLogin: string | null;
  phoneNumber: string | null;
  status: string | null;
  roles: string[] | null;
  groups: string[] | null;
  tenantId?: number | null;
  mfaEnabled?: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  /** Client-side only: resolved authority for route guards. */
  role?: AppRole;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  status: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Permission {
  id: number;
  name: string;
  description?: string | null;
  status?: string | null;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  status: string | null;
}

// ---------------------------------------------------------------------------
// Stats - each service returns its own aggregate shape
// ---------------------------------------------------------------------------

export interface EventStats {
  total: number;
  upcoming: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

export interface TicketStats {
  total: number;
  byStatus: Record<string, number>;
}

export interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
  totalAmount: number;
}

export interface NotificationStats {
  total: number;
  byStatus: Record<string, number>;
}

export interface UserStats {
  total: number;
  registeredToday: number;
  byStatus: Record<string, number>;
}

export interface RevenueSummary {
  totalTransactions: number;
  /** Sum of COMPLETED payments only. */
  totalRevenue: number;
  byStatus: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface OAuthCodeExchangeResponse extends AuthTokens {
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  totpCode?: string;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export interface EventPayload {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  location?: string | null;
  /** `YYYY-MM-DDTHH:mm` - the backend binds LocalDateTime, which rejects a
   *  trailing zone designator, so the datetime-local input value is used as-is. */
  eventDate?: string | null;
  basePrice?: number | null;
  capacity?: number | null;
  eventType?: EventType | null;
  status?: EventStatus | null;
}

export interface TicketPayload {
  eventId: number;
  seatNumber: string;
  price: number;
  ticketType?: TicketType | null;
  ticketStatus?: TicketStatus | null;
}

/**
 * `amount` is accepted by the backend but the server does not recompute it, so
 * the UI sends the ticket price rather than a user-typed figure.
 */
export interface OrderPayload {
  eventId: number;
  ticketId: number;
  quantity: number;
  amount: number;
  paymentMethod: PaymentMethod;
  recipientEmail?: string;
  phoneNumber?: string;
}

export interface UserPayload {
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  password?: string;
  phoneNumber?: string | null;
  userType?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  roles?: string[];
}

// ---------------------------------------------------------------------------
// Generic list wrapper
//
// Only user-service paginates, and it uses `content`/`totalElements`. Every
// other list endpoint returns a bare array, so the pages normalise both shapes
// through this type instead of assuming the paginated field names.
// ---------------------------------------------------------------------------

export interface ListResponse<T> {
  content?: T[];
  data?: T[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  data: unknown;
  is_error: boolean;
}
