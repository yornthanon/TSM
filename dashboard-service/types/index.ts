// Domain Models matching Spring Boot Entities & DTOs

export type RoleType = 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_ORGANIZER';

export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  role: RoleType;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type EventType = 'CONCERT' | 'SPORTS' | 'CONFERENCE' | 'WORKSHOP' | 'FESTIVAL';
export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventItem {
  id: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  eventType: EventType;
  eventStatus: EventStatus;
  totalTickets: number;
  availableTickets: number;
  basePrice: number;
  imageUrl?: string;
  createdAt: string;
}

export type TicketType = 'VIP' | 'REGULAR' | 'EARLY_BIRD' | 'STUDENT';
export type TicketStatus = 'AVAILABLE' | 'LOCKED' | 'SOLD' | 'CANCELLED';

export interface Ticket {
  id: number;
  ticketCode: string;
  eventId: number;
  eventTitle: string;
  seatNumber: string;
  price: number;
  ticketType: TicketType;
  ticketStatus: TicketStatus;
  lockedBy?: string | null;
  lockedUntil?: string | null;
  lockRemainingSeconds?: number;
}

export type OrderStatus = 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: number;
  orderNumber: string;
  eventId: number;
  eventTitle: string;
  ticketId: number;
  ticketCode: string;
  quantity: number;
  amount: number;
  orderStatus: OrderStatus;
  username: string;
  paymentId?: number | null;
  orderDate: string;
}

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: number;
  orderId: number;
  orderNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string;
  createdAt: string;
}

export type NotificationType = 'EMAIL' | 'SMS';
export type NotificationStatus = 'SENT' | 'FAILED' | 'PENDING';

export interface NotificationLog {
  id: number;
  orderId?: number;
  recipient: string;
  recipientEmail?: string;
  phoneNumber?: string;
  notificationType: NotificationType;
  notificationStatus: NotificationStatus;
  subject: string;
  message: string;
  sentAt: string;
}

export interface ApiRoute {
  id: number;
  routeId: string;
  pathPattern: string;
  targetUri: string;
  rateLimitPerSecond: number;
  status: 'ACTIVE' | 'DISABLED';
}

export interface ApiRequestLog {
  id: string;
  correlationId: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  requestPayload?: string;
  responsePayload?: string;
}

export interface ApiResponse<T = any> {
  description: string;
  code: string;
  data: T;
  error: boolean;
}

export interface ServiceHealth {
  name: string;
  port: number;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  database: string;
  description: string;
  latencyMs: number;
  errorCount?: number;
  lastError?: string | null;
}

export interface ServiceErrorLog {
  id: string;
  serviceName: string;
  port: number;
  timestamp: string;
  statusCode: number;
  errorCode: string;
  path: string;
  message: string;
  rootCause: string;
  correlationId: string;
  resolved?: boolean;
}
