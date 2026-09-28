import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  Event,
  EventPayload,
  EventStats,
  Group,
  Notification,
  NotificationStats,
  Order,
  OrderStats,
  Payment,
  Permission,
  RevenueSummary,
  Role,
  Ticket,
  TicketPayload,
  TicketStats,
  User,
  UserPayload,
  UserStats,
} from '../types/api';

export const queryKeys = {
  events: ['events'] as const,
  eventStats: ['events', 'stats'] as const,
  event: (id: number | string) => ['events', 'detail', id] as const,
  tickets: ['tickets'] as const,
  ticketStats: ['tickets', 'stats'] as const,
  orders: ['orders'] as const,
  orderStats: ['orders', 'stats'] as const,
  payments: ['payments'] as const,
  revenue: ['payments', 'revenue'] as const,
  notifications: ['notifications'] as const,
  notificationStats: ['notifications', 'stats'] as const,
  users: ['users'] as const,
  userStats: ['users', 'stats'] as const,
  roles: ['roles'] as const,
  permissions: ['permissions'] as const,
  groups: ['groups'] as const,
  health: ['health'] as const,
};

/**
 * The five list endpoints the dashboard reads all return a bare array, but
 * user-service paginates with `content`. Normalising here keeps every page
 * working against either shape.
 */
function toArray<T>(payload: T[] | { content?: T[]; data?: T[] } | null | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.content ?? payload.data ?? [];
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function useEvents(options?: UseQueryOptions<Event[]>) {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: async () => toArray<Event>(await api.get<Event[]>('/events')),
    ...options,
  });
}

export function useEventStats(options?: UseQueryOptions<EventStats>) {
  return useQuery({
    queryKey: queryKeys.eventStats,
    queryFn: () => api.get<EventStats>('/events/stats'),
    ...options,
  });
}

export function useEvent(id: number | string, options?: UseQueryOptions<Event>) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => api.get<Event>(`/events/${id}`),
    enabled: id !== undefined && id !== '',
    ...options,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventPayload) => api.post<Event>('/events', payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.events });
      void qc.invalidateQueries({ queryKey: queryKeys.eventStats });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EventPayload }) =>
      api.put<Event>(`/events/${id}`, payload),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.events });
      void qc.invalidateQueries({ queryKey: queryKeys.event(variables.id) });
      void qc.invalidateQueries({ queryKey: queryKeys.eventStats });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<unknown>(`/events/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.events });
      void qc.invalidateQueries({ queryKey: queryKeys.eventStats });
    },
  });
}

function useEventDecision(action: 'approve' | 'reject') {
  const qc = useQueryClient();
  return useMutation({
    // Admin routes live under /api/admin, outside the /api/v1 base path.
    mutationFn: (id: number) => api.put<Event>(`/admin/events/${id}/${action}`),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.events });
      void qc.invalidateQueries({ queryKey: queryKeys.event(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.eventStats });
    },
  });
}

export const useApproveEvent = () => useEventDecision('approve');
export const useRejectEvent = () => useEventDecision('reject');

// ---------------------------------------------------------------------------
// Ticket inventory
// ---------------------------------------------------------------------------

export function useTickets(options?: UseQueryOptions<Ticket[]>) {
  return useQuery({
    queryKey: queryKeys.tickets,
    queryFn: async () => toArray<Ticket>(await api.get<Ticket[]>('/tickets')),
    ...options,
  });
}

export function useTicketStats(options?: UseQueryOptions<TicketStats>) {
  return useQuery({
    queryKey: queryKeys.ticketStats,
    queryFn: () => api.get<TicketStats>('/tickets/stats'),
    ...options,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TicketPayload) => api.post<Ticket>('/tickets', payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tickets });
      void qc.invalidateQueries({ queryKey: queryKeys.ticketStats });
    },
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<unknown>(`/tickets/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tickets });
      void qc.invalidateQueries({ queryKey: queryKeys.ticketStats });
    },
  });
}

export function useUnlockTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<unknown>(`/tickets/${id}/unlock`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tickets });
      void qc.invalidateQueries({ queryKey: queryKeys.ticketStats });
    },
  });
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export function useOrders(options?: UseQueryOptions<Order[]>) {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: async () => toArray<Order>(await api.get<Order[]>('/orders')),
    ...options,
  });
}

export function useOrderStats(options?: UseQueryOptions<OrderStats>) {
  return useQuery({
    queryKey: queryKeys.orderStats,
    queryFn: () => api.get<OrderStats>('/orders/stats'),
    ...options,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.put<Order>(`/orders/${id}/cancel`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
      void qc.invalidateQueries({ queryKey: queryKeys.orderStats });
    },
  });
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export function usePayments(options?: UseQueryOptions<Payment[]>) {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: async () => toArray<Payment>(await api.get<Payment[]>('/payments')),
    ...options,
  });
}

export function useRevenueSummary(options?: UseQueryOptions<RevenueSummary>) {
  return useQuery({
    queryKey: queryKeys.revenue,
    queryFn: () => api.get<RevenueSummary>('/payments/revenue-summary'),
    ...options,
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<Payment>(`/payments/${id}/refund`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.payments });
      void qc.invalidateQueries({ queryKey: queryKeys.revenue });
    },
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function useNotifications(options?: UseQueryOptions<Notification[]>) {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () =>
      toArray<Notification>(await api.get<Notification[]>('/notifications')),
    ...options,
  });
}

export function useNotificationStats(options?: UseQueryOptions<NotificationStats>) {
  return useQuery({
    queryKey: queryKeys.notificationStats,
    queryFn: () => api.get<NotificationStats>('/notifications/stats'),
    ...options,
  });
}

export function useResendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<Notification>(`/notifications/${id}/resend`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications });
      void qc.invalidateQueries({ queryKey: queryKeys.notificationStats });
    },
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function useUsers(options?: UseQueryOptions<User[]>) {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => toArray<User>(await api.get<User[]>('/users')),
    ...options,
  });
}

export function useUserStats(options?: UseQueryOptions<UserStats>) {
  return useQuery({
    queryKey: queryKeys.userStats,
    queryFn: () => api.get<UserStats>('/users/stats'),
    ...options,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserPayload> }) =>
      api.put<User>(`/admin/users/${id}`, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users });
      void qc.invalidateQueries({ queryKey: queryKeys.userStats });
    },
  });
}

function useUserStatusAction(action: 'activate' | 'deactivate') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.put<User>(`/admin/users/${id}/${action}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users });
      void qc.invalidateQueries({ queryKey: queryKeys.userStats });
    },
  });
}

export const useActivateUser = () => useUserStatusAction('activate');
export const useDeactivateUser = () => useUserStatusAction('deactivate');

// ---------------------------------------------------------------------------
// Access control
// ---------------------------------------------------------------------------

export function useRoles(options?: UseQueryOptions<Role[]>) {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: async () => toArray<Role>(await api.get<Role[]>('/roles')),
    ...options,
  });
}

export function usePermissions(options?: UseQueryOptions<Permission[]>) {
  return useQuery({
    queryKey: queryKeys.permissions,
    queryFn: async () => toArray<Permission>(await api.get<Permission[]>('/permissions')),
    ...options,
  });
}

export function useGroups(options?: UseQueryOptions<Group[]>) {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: async () => toArray<Group>(await api.get<Group[]>('/groups')),
    ...options,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; status?: string }) =>
      api.post<Role>('/roles/create', payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.roles }),
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; status?: string }) =>
      api.post<Group>('/groups/create', payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.groups }),
  });
}

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------

export interface HealthPayload {
  status: string;
  components?: Record<string, { status: string }>;
}

export function useHealth(options?: UseQueryOptions<HealthPayload>) {
  return useQuery({
    queryKey: queryKeys.health,
    // Actuator is served at the backend origin, not under /api/v1.
    queryFn: () => api.getFromOrigin<HealthPayload>('/actuator/health'),
    retry: false,
    ...options,
  });
}
