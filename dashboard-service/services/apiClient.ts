import {
  EventItem,
  Ticket,
  Order,
  Payment,
  NotificationLog,
  User,
  ApiRoute,
  ApiRequestLog,
  ApiResponse,
  PaymentMethod,
  EventType,
  ServiceHealth,
  ServiceErrorLog,
} from '../types/index';

// Initial Mock Data reflecting standard TicketManagement seed
const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@ticketmaster.com',
    phoneNumber: '+85512345678',
    role: 'ROLE_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 2,
    username: 'organizer_pro',
    email: 'organizer@soundwave.events',
    phoneNumber: '+85598765432',
    role: 'ROLE_ORGANIZER',
    status: 'ACTIVE',
    createdAt: '2026-09-03T10:30:00Z',
  },
  {
    id: 3,
    username: 'sopheap_client',
    email: 'sopheap.client@gmail.com',
    phoneNumber: '+85577665544',
    role: 'ROLE_USER',
    status: 'ACTIVE',
    createdAt: '2026-09-10T14:15:00Z',
  },
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'Phnom Penh Mega Music Fest 2026',
    description: 'The largest electronic and pop live music festival in Cambodia featuring top Asian artists.',
    location: 'Diamond Island (Koh Pich) Convention Center',
    eventDate: '2026-11-20T18:30:00Z',
    eventType: 'CONCERT',
    eventStatus: 'UPCOMING',
    totalTickets: 500,
    availableTickets: 420,
    basePrice: 35.0,
    createdAt: '2026-09-05T09:00:00Z',
  },
  {
    id: 2,
    title: 'Southeast Asia Tech Summit',
    description: 'Keynotes on Cloud Native Microservices, AI Infrastructure, and FinTech integrations.',
    location: 'Sokha Hotel Grand Ballroom, Phnom Penh',
    eventDate: '2026-10-15T09:00:00Z',
    eventType: 'CONFERENCE',
    eventStatus: 'UPCOMING',
    totalTickets: 250,
    availableTickets: 180,
    basePrice: 50.0,
    createdAt: '2026-09-07T11:00:00Z',
  },
  {
    id: 3,
    title: 'National Football Championship Final',
    description: 'Annual cup final with full stadium electric atmosphere.',
    location: 'Morodok Techo National Stadium',
    eventDate: '2026-12-05T17:00:00Z',
    eventType: 'SPORTS',
    eventStatus: 'UPCOMING',
    totalTickets: 1200,
    availableTickets: 980,
    basePrice: 15.0,
    createdAt: '2026-09-08T16:00:00Z',
  },
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 1,
    ticketCode: 'TK-101-VIP',
    eventId: 1,
    eventTitle: 'Phnom Penh Mega Music Fest 2026',
    seatNumber: 'VIP-A01',
    price: 80.0,
    ticketType: 'VIP',
    ticketStatus: 'AVAILABLE',
  },
  {
    id: 2,
    ticketCode: 'TK-102-VIP',
    eventId: 1,
    eventTitle: 'Phnom Penh Mega Music Fest 2026',
    seatNumber: 'VIP-A02',
    price: 80.0,
    ticketType: 'VIP',
    ticketStatus: 'AVAILABLE',
  },
  {
    id: 3,
    ticketCode: 'TK-103-REG',
    eventId: 1,
    eventTitle: 'Phnom Penh Mega Music Fest 2026',
    seatNumber: 'ZONE-B12',
    price: 35.0,
    ticketType: 'REGULAR',
    ticketStatus: 'LOCKED',
    lockedBy: 'sopheap_client',
    lockedUntil: new Date(Date.now() + 180000).toISOString(),
    lockRemainingSeconds: 180,
  },
  {
    id: 4,
    ticketCode: 'TK-104-REG',
    eventId: 1,
    eventTitle: 'Phnom Penh Mega Music Fest 2026',
    seatNumber: 'ZONE-B13',
    price: 35.0,
    ticketType: 'REGULAR',
    ticketStatus: 'SOLD',
  },
  {
    id: 5,
    ticketCode: 'TK-201-TECH',
    eventId: 2,
    eventTitle: 'Southeast Asia Tech Summit',
    seatNumber: 'CONF-045',
    price: 50.0,
    ticketType: 'REGULAR',
    ticketStatus: 'AVAILABLE',
  },
  {
    id: 6,
    ticketCode: 'TK-301-SPT',
    eventId: 3,
    eventTitle: 'National Football Championship Final',
    seatNumber: 'STAND-C10',
    price: 15.0,
    ticketType: 'REGULAR',
    ticketStatus: 'AVAILABLE',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 101,
    orderNumber: 'ORD-20260910-8821',
    eventId: 1,
    eventTitle: 'Phnom Penh Mega Music Fest 2026',
    ticketId: 4,
    ticketCode: 'TK-104-REG',
    quantity: 1,
    amount: 35.0,
    orderStatus: 'COMPLETED',
    username: 'sopheap_client',
    paymentId: 501,
    orderDate: '2026-09-10T14:22:10Z',
  },
  {
    id: 102,
    orderNumber: 'ORD-20260911-4192',
    eventId: 1,
    eventTitle: 'Phnom Penh Mega Music Fest 2026',
    ticketId: 1,
    ticketCode: 'TK-101-VIP',
    quantity: 2,
    amount: 160.0,
    orderStatus: 'COMPLETED',
    username: 'sokha_vip',
    paymentId: 502,
    orderDate: '2026-09-11T10:15:30Z',
  },
  {
    id: 103,
    orderNumber: 'ORD-20260912-9014',
    eventId: 2,
    eventTitle: 'Southeast Asia Tech Summit',
    ticketId: 5,
    ticketCode: 'TK-201-TECH',
    quantity: 3,
    amount: 150.0,
    orderStatus: 'COMPLETED',
    username: 'vireak_tech',
    paymentId: 503,
    orderDate: '2026-09-12T09:40:15Z',
  },
  {
    id: 104,
    orderNumber: 'ORD-20260913-3382',
    eventId: 3,
    eventTitle: 'National Football Championship Final',
    ticketId: 6,
    ticketCode: 'TK-301-SPT',
    quantity: 4,
    amount: 60.0,
    orderStatus: 'COMPLETED',
    username: 'channa_buyer',
    paymentId: 504,
    orderDate: '2026-09-13T16:05:00Z',
  },
  {
    id: 105,
    orderNumber: 'ORD-20260914-7719',
    eventId: 1,
    eventTitle: 'Phnom Penh Mega Music Fest 2026',
    ticketId: 2,
    ticketCode: 'TK-102-VIP',
    quantity: 1,
    amount: 80.0,
    orderStatus: 'COMPLETED',
    username: 'darany_music',
    paymentId: 505,
    orderDate: '2026-09-14T11:20:45Z',
  },
  {
    id: 106,
    orderNumber: 'ORD-20260915-1102',
    eventId: 2,
    eventTitle: 'Southeast Asia Tech Summit',
    ticketId: 5,
    ticketCode: 'TK-201-TECH',
    quantity: 1,
    amount: 50.0,
    orderStatus: 'COMPLETED',
    username: 'monirath_dev',
    paymentId: 506,
    orderDate: '2026-09-15T15:30:10Z',
  },
  {
    id: 107,
    orderNumber: 'ORD-20260915-5590',
    eventId: 3,
    eventTitle: 'National Football Championship Final',
    ticketId: 6,
    ticketCode: 'TK-301-SPT',
    quantity: 2,
    amount: 30.0,
    orderStatus: 'PROCESSING',
    username: 'piseth_sports',
    paymentId: 507,
    orderDate: '2026-09-15T18:45:00Z',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 501,
    orderId: 101,
    orderNumber: 'ORD-20260910-8821',
    amount: 35.0,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'SUCCESS',
    transactionId: 'TXN-998842-VISA',
    createdAt: '2026-09-10T14:22:15Z',
  },
  {
    id: 502,
    orderId: 102,
    orderNumber: 'ORD-20260911-4192',
    amount: 160.0,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'SUCCESS',
    transactionId: 'TXN-ABA-771290',
    createdAt: '2026-09-11T10:15:40Z',
  },
  {
    id: 503,
    orderId: 103,
    orderNumber: 'ORD-20260912-9014',
    amount: 150.0,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'SUCCESS',
    transactionId: 'TXN-MC-331092',
    createdAt: '2026-09-12T09:40:22Z',
  },
  {
    id: 504,
    orderId: 104,
    orderNumber: 'ORD-20260913-3382',
    amount: 60.0,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'SUCCESS',
    transactionId: 'TXN-WING-884102',
    createdAt: '2026-09-13T16:05:10Z',
  },
  {
    id: 505,
    orderId: 105,
    orderNumber: 'ORD-20260914-7719',
    amount: 80.0,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'SUCCESS',
    transactionId: 'TXN-VISA-552091',
    createdAt: '2026-09-14T11:20:50Z',
  },
  {
    id: 506,
    orderId: 106,
    orderNumber: 'ORD-20260915-1102',
    amount: 50.0,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'SUCCESS',
    transactionId: 'TXN-ABA-991244',
    createdAt: '2026-09-15T15:30:15Z',
  },
  {
    id: 507,
    orderId: 107,
    orderNumber: 'ORD-20260915-5590',
    amount: 30.0,
    paymentMethod: 'DEBIT_CARD',
    paymentStatus: 'PENDING',
    transactionId: 'TXN-PEND-00129',
    createdAt: '2026-09-15T18:45:05Z',
  },
];

const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 901,
    orderId: 101,
    recipient: 'sopheap_client',
    recipientEmail: 'sopheap.client@gmail.com',
    phoneNumber: '+85577665544',
    notificationType: 'EMAIL',
    notificationStatus: 'SENT',
    subject: 'Order Confirmed: Phnom Penh Mega Music Fest 2026',
    message: 'Dear sopheap_client, your order ORD-20260910-8821 for 1 ticket (TK-104-REG) was confirmed. Thank you!',
    sentAt: '2026-09-10T14:22:20Z',
  },
  {
    id: 902,
    orderId: 101,
    recipient: 'sopheap_client',
    recipientEmail: 'sopheap.client@gmail.com',
    phoneNumber: '+85577665544',
    notificationType: 'SMS',
    notificationStatus: 'SENT',
    subject: 'Ticket Ready - SMS',
    message: 'TicketManagement: Order #ORD-20260910-8821 confirmed. Seat: ZONE-B13. Show SMS at entry.',
    sentAt: '2026-09-10T14:22:22Z',
  },
];

const INITIAL_ROUTES: ApiRoute[] = [
  {
    id: 1,
    routeId: 'auth-service-v1',
    pathPattern: '/api/v1/auth/**',
    targetUri: 'http://user-service:8081',
    rateLimitPerSecond: 30,
    status: 'ACTIVE',
  },
  {
    id: 2,
    routeId: 'user-service-v1',
    pathPattern: '/api/v1/users/**',
    targetUri: 'http://user-service:8081',
    rateLimitPerSecond: 50,
    status: 'ACTIVE',
  },
  {
    id: 3,
    routeId: 'event-service-v1',
    pathPattern: '/api/v1/events/**',
    targetUri: 'http://event-service:8082',
    rateLimitPerSecond: 100,
    status: 'ACTIVE',
  },
  {
    id: 4,
    routeId: 'ticket-service-v1',
    pathPattern: '/api/v1/tickets/**',
    targetUri: 'http://ticket-service:8083',
    rateLimitPerSecond: 80,
    status: 'ACTIVE',
  },
  {
    id: 5,
    routeId: 'order-service-v1',
    pathPattern: '/api/v1/orders/**',
    targetUri: 'http://order-service:8084',
    rateLimitPerSecond: 40,
    status: 'ACTIVE',
  },
  {
    id: 6,
    routeId: 'payment-service-v1',
    pathPattern: '/api/v1/payments/**',
    targetUri: 'http://payment-service:8085',
    rateLimitPerSecond: 30,
    status: 'ACTIVE',
  },
  {
    id: 7,
    routeId: 'notification-service-v1',
    pathPattern: '/api/v1/notifications/**',
    targetUri: 'http://notification-service:8086',
    rateLimitPerSecond: 60,
    status: 'ACTIVE',
  },
];

const INITIAL_SERVICE_ERRORS: ServiceErrorLog[] = [
  {
    id: 'ERR-101',
    serviceName: 'Ticket Service',
    port: 8083,
    timestamp: '2026-09-15T22:54:12Z',
    statusCode: 504,
    errorCode: 'REDIS_LOCK_TIMEOUT',
    path: '/api/v1/tickets/14/lock',
    message: 'Redis distributed lock acquisition timed out after 5000ms',
    rootCause: 'Redis key "lock:ticket:14" already held by session usr_8829; lock lease not released in time.',
    correlationId: 'c8a1e204-9821-4d11-b519-897721ab0192',
    resolved: false,
  },
  {
    id: 'ERR-102',
    serviceName: 'Payment Service',
    port: 8085,
    timestamp: '2026-09-15T21:40:05Z',
    statusCode: 502,
    errorCode: 'PAYMENT_GATEWAY_TIMEOUT',
    path: '/api/v1/payments',
    message: 'Upstream payment processor (ABA PayWay / Card Gateway) connection timeout',
    rootCause: 'HTTP 504 Gateway Timeout from acquirer endpoint https://api.payway.com.kh/v2/charge',
    correlationId: 'f93d44bc-3301-4991-88ae-410091823120',
    resolved: false,
  },
  {
    id: 'ERR-103',
    serviceName: 'API Gateway',
    port: 8080,
    timestamp: '2026-09-15T20:15:30Z',
    statusCode: 429,
    errorCode: 'RATE_LIMIT_EXCEEDED',
    path: '/api/v1/tickets',
    message: 'Too Many Requests: Rate limit exceeded (Redis Token Bucket exhausted)',
    rootCause: 'Client IP 192.168.1.105 exceeded 40 requests/sec limit on route "ticket-service-v1".',
    correlationId: 'a12903fe-2201-4478-9a31-778811902231',
    resolved: true,
  },
  {
    id: 'ERR-104',
    serviceName: 'Order Service',
    port: 8084,
    timestamp: '2026-09-15T19:02:18Z',
    statusCode: 409,
    errorCode: 'SEAT_CONCURRENCY_CONFLICT',
    path: '/api/v1/orders',
    message: 'Optimistic lock exception: Selected seat was concurrently booked by another customer',
    rootCause: 'Row version mismatch in ticket_order_db. Order creation aborted to prevent double booking.',
    correlationId: 'd0012e88-1188-44aa-99bb-665544332211',
    resolved: true,
  },
  {
    id: 'ERR-105',
    serviceName: 'Notification Service',
    port: 8086,
    timestamp: '2026-09-15T17:28:44Z',
    statusCode: 503,
    errorCode: 'SMTP_CONNECTION_REFUSED',
    path: '/api/v1/notifications/904/retry',
    message: 'Failed to dispatch ticket confirmation email to sopheap.client@gmail.com',
    rootCause: 'java.net.ConnectException: Connection refused to mail.smtp.cambodia.local:587',
    correlationId: 'ee4819aa-7766-4112-98ab-332211009988',
    resolved: false,
  },
];

// Local Storage helpers
function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`ticket_mgmt_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(`ticket_mgmt_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

export class ApiService {
  private static instance: ApiService;
  private gatewayUrl: string = 'http://localhost:8080/api';
  private mode: 'live' | 'simulator' = 'simulator';
  private jwtToken: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXX0';
  private currentUsername: string = 'admin';
  private currentUserRole: string = 'ROLE_ADMIN';
  private logs: ApiRequestLog[] = [];
  private logSubscribers: ((log: ApiRequestLog) => void)[] = [];
  private serviceErrors: ServiceErrorLog[] = [];
  private errorSubscribers: ((err: ServiceErrorLog) => void)[] = [];

  // In-memory / localStorage state
  private users: User[];
  private events: EventItem[];
  private tickets: Ticket[];
  private orders: Order[];
  private payments: Payment[];
  private notifications: NotificationLog[];
  private routes: ApiRoute[];

  private constructor() {
    this.serviceErrors = loadStorage('service_errors', INITIAL_SERVICE_ERRORS);
    this.users = loadStorage('users', INITIAL_USERS);
    this.events = loadStorage('events', INITIAL_EVENTS);
    this.tickets = loadStorage('tickets', INITIAL_TICKETS);
    this.orders = loadStorage('orders', INITIAL_ORDERS);
    if (!this.orders || this.orders.length < INITIAL_ORDERS.length) {
      this.orders = INITIAL_ORDERS;
      saveStorage('orders', this.orders);
    }
    this.payments = loadStorage('payments', INITIAL_PAYMENTS);
    if (!this.payments || this.payments.length < INITIAL_PAYMENTS.length) {
      this.payments = INITIAL_PAYMENTS;
      saveStorage('payments', this.payments);
    }
    this.notifications = loadStorage('notifications', INITIAL_NOTIFICATIONS);
    this.routes = loadStorage('routes', INITIAL_ROUTES);
    this.gatewayUrl = localStorage.getItem('ticket_mgmt_gateway_url') || 'http://localhost:8080/api';
    this.mode = (localStorage.getItem('ticket_mgmt_mode') as any) || 'simulator';

    // Start tick to decrement lock timers
    setInterval(() => {
      this.tickTicketLocks();
    }, 1000);
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public getGatewayUrl(): string {
    return this.gatewayUrl;
  }

  public setGatewayUrl(url: string) {
    this.gatewayUrl = url;
    localStorage.setItem('ticket_mgmt_gateway_url', url);
  }

  public getMode(): 'live' | 'simulator' {
    return this.mode;
  }

  public setMode(mode: 'live' | 'simulator') {
    this.mode = mode;
    localStorage.setItem('ticket_mgmt_mode', mode);
  }

  public getJwtToken(): string {
    return this.jwtToken;
  }

  public getCurrentUser(): { username: string; role: string } {
    return { username: this.currentUsername, role: this.currentUserRole };
  }

  public setCurrentUser(user: { username: string; role: string }) {
    this.currentUsername = user.username;
    this.currentUserRole = user.role;
  }

  public onLog(callback: (log: ApiRequestLog) => void) {
    this.logSubscribers.push(callback);
    return () => {
      this.logSubscribers = this.logSubscribers.filter((cb) => cb !== callback);
    };
  }

  public getLogs(): ApiRequestLog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }

  private recordLog(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    requestPayload?: any,
    responsePayload?: any
  ) {
    const correlationId = 'corr-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
    const log: ApiRequestLog = {
      id: Math.random().toString(36).substring(2, 9),
      correlationId,
      timestamp: new Date().toISOString(),
      method,
      path,
      statusCode,
      durationMs,
      requestPayload: requestPayload ? JSON.stringify(requestPayload) : undefined,
      responsePayload: responsePayload ? JSON.stringify(responsePayload) : undefined,
    };
    this.logs.unshift(log);
    if (this.logs.length > 50) this.logs.pop();
    this.logSubscribers.forEach((cb) => cb(log));
  }

  // Periodic expiration check for Redis distributed lock emulation
  private tickTicketLocks() {
    let changed = false;
    const now = Date.now();
    this.tickets = this.tickets.map((ticket) => {
      if (ticket.ticketStatus === 'LOCKED' && ticket.lockedUntil) {
        const remaining = Math.max(0, Math.floor((new Date(ticket.lockedUntil).getTime() - now) / 1000));
        if (remaining <= 0) {
          changed = true;
          return {
            ...ticket,
            ticketStatus: 'AVAILABLE',
            lockedBy: null,
            lockedUntil: null,
            lockRemainingSeconds: 0,
          };
        }
        return {
          ...ticket,
          lockRemainingSeconds: remaining,
        };
      }
      return ticket;
    });

    if (changed) {
      saveStorage('tickets', this.tickets);
    }
  }

  // Generic Request Dispatcher
  public async request<T = any>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();

    // If LIVE mode, attempt fetch from gateway
    if (this.mode === 'live') {
      try {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.gatewayUrl}${cleanEndpoint}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Correlation-ID': 'corr-front-' + Math.random().toString(36).substring(2, 8),
        };
        if (this.jwtToken) {
          headers['Authorization'] = `Bearer ${this.jwtToken}`;
        }

        const res = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);
        this.recordLog(method, endpoint, res.status, duration, body, data);

        return data;
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        const errorResponse: ApiResponse<T> = {
          description: `Live Gateway Connection Failed (${err.message}). Showing simulated backend response.`,
          code: '503',
          data: null as any,
          error: true,
        };
        this.recordLog(method, endpoint, 503, duration, body, errorResponse);
        // Fall back to local simulator so user experience is not broken
        return this.handleSimulatedRequest<T>(method, endpoint, body, startTime);
      }
    }

    // Default: Simulator Mode
    return this.handleSimulatedRequest<T>(method, endpoint, body, startTime);
  }

  private handleSimulatedRequest<T>(
    method: string,
    endpoint: string,
    body: any,
    startTime: number
  ): Promise<ApiResponse<T>> {
    // Artificial latency between 40ms and 150ms to simulate real network hops through Gateway
    const simLatency = Math.floor(Math.random() * 80) + 50;

    return new Promise((resolve) => {
      setTimeout(() => {
        const res = this.executeSimulatedLogic(method, endpoint, body);
        const duration = Math.round(performance.now() - startTime);
        this.recordLog(method, endpoint, res.error ? 400 : 200, duration, body, res);
        resolve(res as ApiResponse<T>);
      }, simLatency);
    });
  }

  private executeSimulatedLogic(method: string, endpoint: string, body: any): ApiResponse<any> {
    const clean = endpoint.replace(/^\/api/, '');

    // 1. AUTH: POST /api/v1/auth/login or /api/public/users/login
    if ((clean === '/v1/auth/login' || clean === '/public/users/login') && method === 'POST') {
      const { username, password } = body || {};
      const user = this.users.find((u) => u.username === username);
      if (user) {
        this.currentUsername = user.username;
        this.currentUserRole = user.role;
        return {
          description: 'Login successful',
          code: '200',
          data: {
            accessToken: `jwt.simulated.token.${user.username}.${Date.now()}`,
            refreshToken: `refresh.${user.username}.${Date.now()}`,
            user,
          },
          error: false,
        };
      }
      return {
        description: 'Bad credentials or user not found',
        code: '401',
        data: null,
        error: true,
      };
    }

    // 2. AUTH: POST /api/v1/auth/register or /api/public/users/registration
    if ((clean === '/v1/auth/register' || clean === '/v1/auth/registration' || clean === '/public/users/registration') && method === 'POST') {
      const newUser: User = {
        id: this.users.length + 1,
        username: body.username || 'new_user',
        email: body.email || 'user@example.com',
        phoneNumber: body.phoneNumber || '+85500000000',
        role: (body.role as any) || 'ROLE_USER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      this.users.push(newUser);
      saveStorage('users', this.users);
      return {
        description: 'User registered successfully',
        code: '201',
        data: newUser,
        error: false,
      };
    }

    // 3. USERS: GET /api/v1/users
    if (clean.startsWith('/v1/users') && method === 'GET') {
      return {
        description: 'SUCCESS',
        code: '200',
        data: this.users,
        error: false,
      };
    }

    // 3b. USERS: POST /api/v1/users (clean REST create user)
    if ((clean === '/v1/users' || clean === '/v1/users/create') && method === 'POST') {
      const newUser: User = {
        id: this.users.length + 1,
        username: body.username || 'user_' + Date.now().toString().slice(-4),
        email: body.email || 'user@ticket.local',
        phoneNumber: body.phoneNumber || '+85512345678',
        role: (body.role as any) || 'ROLE_USER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      this.users.push(newUser);
      saveStorage('users', this.users);
      return {
        description: 'User created successfully',
        code: '201',
        data: newUser,
        error: false,
      };
    }

    // 4. EVENTS: GET /api/v1/events
    if (clean === '/v1/events' && method === 'GET') {
      return {
        description: 'SUCCESS',
        code: '200',
        data: this.events,
        error: false,
      };
    }

    // 5. EVENTS: POST /api/v1/events or /api/v1/events/create
    if ((clean === '/v1/events' || clean === '/v1/events/create') && method === 'POST') {
      const newEvent: EventItem = {
        id: this.events.length + 1,
        title: body.title || 'Untitled Event',
        description: body.description || '',
        location: body.location || 'Phnom Penh',
        eventDate: body.eventDate || new Date(Date.now() + 86400000 * 7).toISOString(),
        eventType: body.eventType || 'CONCERT',
        eventStatus: 'UPCOMING',
        totalTickets: Number(body.totalTickets) || 100,
        availableTickets: Number(body.totalTickets) || 100,
        basePrice: Number(body.basePrice) || 20,
        createdAt: new Date().toISOString(),
      };
      this.events.unshift(newEvent);
      saveStorage('events', this.events);

      // Auto-generate some initial tickets for this event
      const newTickets: Ticket[] = [];
      for (let i = 1; i <= Math.min(5, newEvent.totalTickets); i++) {
        newTickets.push({
          id: this.tickets.length + i,
          ticketCode: `TK-${newEvent.id}0${i}-REG`,
          eventId: newEvent.id,
          eventTitle: newEvent.title,
          seatNumber: `SEAT-${String.fromCharCode(64 + i)}01`,
          price: newEvent.basePrice,
          ticketType: 'REGULAR',
          ticketStatus: 'AVAILABLE',
        });
      }
      this.tickets = [...newTickets, ...this.tickets];
      saveStorage('tickets', this.tickets);

      return {
        description: 'Event created successfully in event-service',
        code: '200',
        data: newEvent,
        error: false,
      };
    }

    // 6. TICKETS: GET /api/v1/tickets
    if (clean.startsWith('/v1/tickets') && method === 'GET') {
      return {
        description: 'SUCCESS',
        code: '200',
        data: this.tickets,
        error: false,
      };
    }

    // 6b. TICKETS: POST /api/v1/tickets (create ticket)
    if ((clean === '/v1/tickets' || clean === '/v1/tickets/create') && method === 'POST') {
      const newTicket: Ticket = {
        id: this.tickets.length + 1,
        ticketCode: body.ticketCode || `TK-${Date.now().toString().slice(-5)}`,
        eventId: Number(body.eventId) || 1,
        eventTitle: body.eventTitle || 'General Event',
        seatNumber: body.seatNumber || `SEAT-${this.tickets.length + 1}`,
        price: Number(body.price) || 25,
        ticketType: body.ticketType || 'REGULAR',
        ticketStatus: 'AVAILABLE',
      };
      this.tickets.unshift(newTicket);
      saveStorage('tickets', this.tickets);
      return {
        description: 'Ticket created successfully in ticket-service',
        code: '200',
        data: newTicket,
        error: false,
      };
    }

    // 7. TICKETS: POST /api/v1/tickets/{id}/lock or /api/v1/tickets/lock (Redis distributed lock)
    const isTicketLockPost = (clean === '/v1/tickets/lock' || (clean.startsWith('/v1/tickets/') && clean.endsWith('/lock'))) && method === 'POST';
    if (isTicketLockPost) {
      let ticketId = body?.ticketId;
      if (!ticketId) {
        const match = clean.match(/\/v1\/tickets\/(\d+)\/lock/);
        if (match) ticketId = match[1];
      }
      const durationSeconds = body?.durationSeconds || 120;
      const username = body?.username || this.currentUsername;
      const ticket = this.tickets.find((t) => t.id === Number(ticketId));

      if (!ticket) {
        return {
          description: 'Ticket not found',
          code: '404',
          data: null,
          error: true,
        };
      }

      if (ticket.ticketStatus === 'SOLD') {
        return {
          description: 'Ticket already SOLD and cannot be locked',
          code: '400',
          data: null,
          error: true,
        };
      }

      if (ticket.ticketStatus === 'LOCKED' && ticket.lockedBy !== username) {
        return {
          description: `Redis Lock conflict: Ticket is currently locked by '${ticket.lockedBy}' until ${ticket.lockedUntil}`,
          code: '409',
          data: null,
          error: true,
        };
      }

      const lockedUntil = new Date(Date.now() + durationSeconds * 1000).toISOString();
      ticket.ticketStatus = 'LOCKED';
      ticket.lockedBy = username;
      ticket.lockedUntil = lockedUntil;
      ticket.lockRemainingSeconds = durationSeconds;

      saveStorage('tickets', this.tickets);

      return {
        description: `Redis distributed lock acquired successfully (TTL: ${durationSeconds}s)`,
        code: '200',
        data: ticket,
        error: false,
      };
    }

    // 8. TICKETS: DELETE /api/v1/tickets/{id}/lock or POST /api/v1/tickets/unlock
    const isTicketUnlock = 
      ((clean.startsWith('/v1/tickets/') && clean.endsWith('/lock')) && method === 'DELETE') ||
      (clean === '/v1/tickets/unlock' && method === 'POST') ||
      (clean.startsWith('/v1/tickets/') && clean.endsWith('/unlock') && method === 'POST');

    if (isTicketUnlock) {
      let ticketId = body?.ticketId;
      if (!ticketId) {
        const match = clean.match(/\/v1\/tickets\/(\d+)\/(lock|unlock)/);
        if (match) ticketId = match[1];
      }
      const ticket = this.tickets.find((t) => t.id === Number(ticketId));
      if (ticket && ticket.ticketStatus === 'LOCKED') {
        ticket.ticketStatus = 'AVAILABLE';
        ticket.lockedBy = null;
        ticket.lockedUntil = null;
        ticket.lockRemainingSeconds = 0;
        saveStorage('tickets', this.tickets);
      }
      return {
        description: 'Ticket unlocked',
        code: '200',
        data: ticket,
        error: false,
      };
    }

    // 9. ORDERS: POST /api/v1/orders or /api/v1/orders/create
    // Flow: Order -> Payment -> Kafka Event -> Notification
    if ((clean === '/v1/orders' || clean === '/v1/orders/create') && method === 'POST') {
      const {
        eventId,
        ticketId,
        quantity = 1,
        amount,
        paymentMethod = 'CREDIT_CARD',
        recipientEmail,
        phoneNumber,
      } = body;

      const event = this.events.find((e) => e.id === Number(eventId));
      const ticket = this.tickets.find((t) => t.id === Number(ticketId));

      const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      // 1. Create Payment
      const paymentId = this.payments.length + 501;
      const newPayment: Payment = {
        id: paymentId,
        orderId: this.orders.length + 101,
        orderNumber,
        amount: Number(amount) || ticket?.price || 30.0,
        paymentMethod: paymentMethod as PaymentMethod,
        paymentStatus: 'SUCCESS',
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}-${paymentMethod}`,
        createdAt: new Date().toISOString(),
      };
      this.payments.unshift(newPayment);
      saveStorage('payments', this.payments);

      // 2. Create Order
      const newOrder: Order = {
        id: this.orders.length + 101,
        orderNumber,
        eventId: Number(eventId),
        eventTitle: event?.title || 'General Event',
        ticketId: Number(ticketId),
        ticketCode: ticket?.ticketCode || `TK-${ticketId}`,
        quantity: Number(quantity),
        amount: newPayment.amount,
        orderStatus: 'COMPLETED',
        username: this.currentUsername,
        paymentId: newPayment.id,
        orderDate: new Date().toISOString(),
      };
      this.orders.unshift(newOrder);
      saveStorage('orders', this.orders);

      // 3. Mark Ticket as SOLD
      if (ticket) {
        ticket.ticketStatus = 'SOLD';
        ticket.lockedBy = null;
        ticket.lockedUntil = null;
        ticket.lockRemainingSeconds = 0;
        saveStorage('tickets', this.tickets);
      }
      if (event && event.availableTickets > 0) {
        event.availableTickets = Math.max(0, event.availableTickets - Number(quantity));
        saveStorage('events', this.events);
      }

      // 4. Publish Kafka Event & Generate Notifications
      const emailNotif: NotificationLog = {
        id: this.notifications.length + 901,
        orderId: newOrder.id,
        recipient: this.currentUsername,
        recipientEmail: recipientEmail || 'customer@example.com',
        phoneNumber: phoneNumber || '+85512345678',
        notificationType: 'EMAIL',
        notificationStatus: 'SENT',
        subject: `Order Confirmed: ${newOrder.eventTitle}`,
        message: `Hello ${this.currentUsername}, your order ${newOrder.orderNumber} ($${newOrder.amount}) for ${newOrder.eventTitle} is confirmed. Seat code: ${newOrder.ticketCode}.`,
        sentAt: new Date().toISOString(),
      };

      const smsNotif: NotificationLog = {
        id: this.notifications.length + 902,
        orderId: newOrder.id,
        recipient: this.currentUsername,
        recipientEmail: recipientEmail || 'customer@example.com',
        phoneNumber: phoneNumber || '+85512345678',
        notificationType: 'SMS',
        notificationStatus: 'SENT',
        subject: 'SMS Ticket Confirmation',
        message: `TicketManagement: Order ${newOrder.orderNumber} confirmed! Ticket: ${newOrder.ticketCode}. Keep this SMS for entry.`,
        sentAt: new Date().toISOString(),
      };

      this.notifications.unshift(emailNotif, smsNotif);
      saveStorage('notifications', this.notifications);

      return {
        description: 'Order created, payment verified, and Kafka notification emitted successfully',
        code: '200',
        data: {
          order: newOrder,
          payment: newPayment,
          notifications: [emailNotif, smsNotif],
        },
        error: false,
      };
    }

    // 10. ORDERS: GET /api/v1/orders
    if (clean.startsWith('/v1/orders') && method === 'GET') {
      return {
        description: 'SUCCESS',
        code: '200',
        data: this.orders,
        error: false,
      };
    }

    // 11. PAYMENTS: GET /api/v1/payments
    if (clean.startsWith('/v1/payments') && method === 'GET') {
      return {
        description: 'SUCCESS',
        code: '200',
        data: this.payments,
        error: false,
      };
    }

    // 11b. PAYMENTS: POST /api/v1/payments (clean REST process payment)
    if ((clean === '/v1/payments' || clean === '/v1/payments/process') && method === 'POST') {
      const paymentId = this.payments.length + 501;
      const newPayment: Payment = {
        id: paymentId,
        orderId: Number(body.orderId) || 101,
        orderNumber: body.orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
        amount: Number(body.amount) || 25.0,
        paymentMethod: body.paymentMethod || 'CREDIT_CARD',
        paymentStatus: 'SUCCESS',
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}-${body.paymentMethod || 'CARD'}`,
        createdAt: new Date().toISOString(),
      };
      this.payments.unshift(newPayment);
      saveStorage('payments', this.payments);
      return {
        description: 'Payment processed successfully',
        code: '200',
        data: newPayment,
        error: false,
      };
    }

    // 12. NOTIFICATIONS: GET /api/v1/notifications
    if (clean.startsWith('/v1/notifications') && method === 'GET') {
      return {
        description: 'SUCCESS',
        code: '200',
        data: this.notifications,
        error: false,
      };
    }

    // 13. NOTIFICATIONS: POST /api/v1/notifications/:id/resend or /api/v1/notifications/:id/retry
    if ((clean.includes('/resend') || clean.includes('/retry')) && method === 'POST') {
      return {
        description: 'Notification re-queued and dispatched via SMTP/Twilio',
        code: '200',
        data: { resend: true, timestamp: new Date().toISOString() },
        error: false,
      };
    }

    // 14. GATEWAY ROUTES: GET /routes
    if (clean === '/routes' && method === 'GET') {
      return {
        description: 'Dynamic routes loaded from database',
        code: '200',
        data: this.routes,
        error: false,
      };
    }

    // Fallback default response
    return {
      description: `Endpoint ${method} ${clean} executed successfully`,
      code: '200',
      data: { status: 'OK', timestamp: new Date().toISOString() },
      error: false,
    };
  }

  // System Health & Service Error Monitoring
  public getServicesHealth(): ServiceHealth[] {
    const isLive = this.mode === 'live';
    const services = [
      {
        name: 'API Gateway',
        port: 8080,
        status: isLive ? 'UP' : 'UP',
        database: 'ticket_gateway_db (R2DBC)',
        description: 'JWT Auth, Redis Rate Limiter, CorrelationId, Dynamic Routing',
        latencyMs: 14,
      },
      {
        name: 'User Service',
        port: 8081,
        status: 'UP',
        database: 'ticket_user_db (PostgreSQL)',
        description: 'Spring Security, RBAC, Refresh Tokens, Password BCrpyt',
        latencyMs: 22,
      },
      {
        name: 'Event Service',
        port: 8082,
        status: 'UP',
        database: 'ticket_event_db (PostgreSQL)',
        description: 'Event catalog, date management, venue details',
        latencyMs: 18,
      },
      {
        name: 'Ticket Service',
        port: 8083,
        status: 'UP',
        database: 'ticket_db + Redis Lock',
        description: 'Seat allocation, Distributed locking via Redis SETNX',
        latencyMs: 26,
      },
      {
        name: 'Order Service',
        port: 8084,
        status: 'UP',
        database: 'ticket_order_db (PostgreSQL)',
        description: 'Order Orchestrator, Kafka Producer (order-confirmed-topic)',
        latencyMs: 35,
      },
      {
        name: 'Payment Service',
        port: 8085,
        status: 'UP',
        database: 'PostgreSQL',
        description: 'Payment gateway processor, card/bank verification',
        latencyMs: 40,
      },
      {
        name: 'Notification Service',
        port: 8086,
        status: 'UP',
        database: 'ticket_notification_db',
        description: 'Kafka Consumer, Email (JavaMailSender), SMS (Twilio)',
        latencyMs: 19,
      },
      {
        name: 'Redis',
        port: 6379,
        status: 'UP',
        database: 'In-Memory Key-Value',
        description: 'Rate Limiting & Ticket Mutex Locks',
        latencyMs: 2,
      },
      {
        name: 'Apache Kafka',
        port: 9092,
        status: 'UP',
        database: 'Distributed Log',
        description: 'Topic: order-confirmed-topic',
        latencyMs: 6,
      },
    ];

    return services.map((s) => {
      const activeErrors = this.serviceErrors.filter(
        (e) => e.serviceName.toLowerCase() === s.name.toLowerCase() && !e.resolved
      );
      const totalErrors = this.serviceErrors.filter(
        (e) => e.serviceName.toLowerCase() === s.name.toLowerCase()
      );
      const lastErr = totalErrors[0]?.message || null;
      let status: 'UP' | 'DOWN' | 'DEGRADED' = 'UP';
      if (activeErrors.length > 1) status = 'DEGRADED';
      if (activeErrors.some((e) => e.statusCode >= 500 && !e.resolved && e.errorCode.includes('TIMEOUT'))) {
        status = 'DEGRADED';
      }

      return {
        ...s,
        status,
        errorCount: totalErrors.length,
        lastError: lastErr,
      };
    });
  }

  // --- SERVICE ERROR LOG MANAGEMENT ---
  public getServiceErrors(serviceName?: string): ServiceErrorLog[] {
    if (serviceName && serviceName !== 'ALL') {
      return this.serviceErrors.filter(
        (e) => e.serviceName.toLowerCase() === serviceName.toLowerCase()
      );
    }
    return [...this.serviceErrors];
  }

  public addServiceError(
    err: Omit<ServiceErrorLog, 'id' | 'timestamp'>
  ): ServiceErrorLog {
    const newError: ServiceErrorLog = {
      ...err,
      id: `ERR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    this.serviceErrors = [newError, ...this.serviceErrors];
    saveStorage('service_errors', this.serviceErrors);
    this.errorSubscribers.forEach((cb) => cb(newError));
    return newError;
  }

  public resolveServiceError(errorId: string): void {
    this.serviceErrors = this.serviceErrors.map((e) =>
      e.id === errorId ? { ...e, resolved: true } : e
    );
    saveStorage('service_errors', this.serviceErrors);
  }

  public clearServiceErrors(serviceName?: string): void {
    if (serviceName && serviceName !== 'ALL') {
      this.serviceErrors = this.serviceErrors.filter(
        (e) => e.serviceName.toLowerCase() !== serviceName.toLowerCase()
      );
    } else {
      this.serviceErrors = [];
    }
    saveStorage('service_errors', this.serviceErrors);
  }

  public onError(callback: (err: ServiceErrorLog) => void): () => void {
    this.errorSubscribers.push(callback);
    return () => {
      this.errorSubscribers = this.errorSubscribers.filter((cb) => cb !== callback);
    };
  }

  public simulateServiceError(serviceName: string, errorScenario?: string): ServiceErrorLog {
    const errorMap: Record<string, Partial<ServiceErrorLog>> = {
      'Ticket Service': {
        port: 8083,
        statusCode: 504,
        errorCode: 'REDIS_LOCK_TIMEOUT',
        path: '/api/v1/tickets/lock',
        message: 'Redis distributed lock timeout: Concurrency lock key "lock:ticket" expired before state persist',
        rootCause: 'Redis key mutex expired after 3000ms threshold during high concurrent booking spike.',
      },
      'Payment Service': {
        port: 8085,
        statusCode: 502,
        errorCode: 'PAYMENT_ACQUIRER_FAILED',
        path: '/api/v1/payments',
        message: 'Payment Gateway 502: External bank gateway communication failure',
        rootCause: 'Connection reset by peer at payment provider gateway endpoint.',
      },
      'API Gateway': {
        port: 8080,
        statusCode: 429,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        path: '/api/v1/events',
        message: 'Too Many Requests (429): Redis Token Bucket quota exhausted for client IP',
        rootCause: 'Exceeded maximum permitted rate of 40 requests/sec defined in GatewayRouteLocator.',
      },
      'Order Service': {
        port: 8084,
        statusCode: 409,
        errorCode: 'ORDER_CONFLICT',
        path: '/api/v1/orders',
        message: 'Optimistic concurrency error: Ticket inventory version mismatch',
        rootCause: 'Row version conflict during parallel commit of order transaction.',
      },
      'User Service': {
        port: 8081,
        statusCode: 401,
        errorCode: 'BAD_CREDENTIALS',
        path: '/api/v1/auth/login',
        message: 'Unauthorized: Authentication token failed cryptographic signature verification',
        rootCause: 'io.jsonwebtoken.security.SignatureException: JWT signature does not match locally computed signature.',
      },
      'Notification Service': {
        port: 8086,
        statusCode: 503,
        errorCode: 'KAFKA_CONSUMER_LAG',
        path: '/api/v1/notifications',
        message: 'Kafka consumer partition lag exceeded threshold on order-confirmed-topic',
        rootCause: 'Consumer group "notification-workers" stalled due to downstream email provider rate limit.',
      },
    };

    const scenario = errorMap[serviceName] || {
      port: 8080,
      statusCode: 500,
      errorCode: 'INTERNAL_SERVICE_ERROR',
      path: `/api/v1/${serviceName.toLowerCase().replace(' ', '-')}`,
      message: `Internal server error encountered in ${serviceName}`,
      rootCause: `Unexpected runtime exception in microservice ${serviceName}`,
    };

    return this.addServiceError({
      serviceName,
      port: scenario.port || 8080,
      statusCode: scenario.statusCode || 500,
      errorCode: scenario.errorCode || 'SERVICE_ERROR',
      path: scenario.path || '/api',
      message: errorScenario || scenario.message || 'Service error occurred',
      rootCause: scenario.rootCause || 'Underlying service failure',
      correlationId: `err-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
    });
  }

  // Reset sample data
  public resetToDefaults() {
    this.users = INITIAL_USERS;
    this.events = INITIAL_EVENTS;
    this.tickets = INITIAL_TICKETS;
    this.orders = INITIAL_ORDERS;
    this.payments = INITIAL_PAYMENTS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.routes = INITIAL_ROUTES;
    saveStorage('users', this.users);
    saveStorage('events', this.events);
    saveStorage('tickets', this.tickets);
    saveStorage('orders', this.orders);
    saveStorage('payments', this.payments);
    saveStorage('notifications', this.notifications);
    saveStorage('routes', this.routes);
  }
}

export const api = ApiService.getInstance();
