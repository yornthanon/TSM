import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { api } from '../lib/api';
import { auth } from '../lib/auth';
import type {
  Ticket,
  TicketStats,
  Comment,
  ActivityLog,
  ApiError,
  PaginatedResponse,
  User,
  CreateTicketData,
  UpdateTicketData,
  CommentData,
  TicketQueryParams,
} from '../types/api';

export const queryKeys = {
  tickets: (params?: TicketQueryParams) => ['tickets', params] as const,
  ticket: (id: string) => ['ticket', id] as const,
  ticketStats: () => ['ticketStats'] as const,
  comments: (ticketId: string) => ['comments', ticketId] as const,
  activity: (ticketId: string) => ['activity', ticketId] as const,
  user: () => ['user'] as const,
  apiErrors: (page?: number, limit?: number, filters?: Record<string, unknown>) =>
    ['apiErrors', { page, limit, filters }] as const,
};

export function useTickets(
  params?: TicketQueryParams,
  options?: UseQueryOptions<PaginatedResponse<Ticket>>
) {
  return useQuery({
    queryKey: queryKeys.tickets(params),
    queryFn: () =>
      api.get<PaginatedResponse<Ticket>>('/tickets', { params }),
    ...options,
  });
}

export function useTicket(id: string, options?: UseQueryOptions<Ticket>) {
  return useQuery({
    queryKey: queryKeys.ticket(id),
    queryFn: () => api.get<Ticket>(`/tickets/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useTicketStats(options?: UseQueryOptions<TicketStats>) {
  return useQuery({
    queryKey: queryKeys.ticketStats(),
    queryFn: () => api.get<TicketStats>('/tickets/stats'),
    ...options,
  });
}

export function useComments(ticketId: string, options?: UseQueryOptions<Comment[]>) {
  return useQuery({
    queryKey: queryKeys.comments(ticketId),
    queryFn: () => api.get<Comment[]>(`/tickets/${ticketId}/comments`),
    enabled: !!ticketId,
    ...options,
  });
}

export function useActivity(ticketId: string, options?: UseQueryOptions<ActivityLog[]>) {
  return useQuery({
    queryKey: queryKeys.activity(ticketId),
    queryFn: () => api.get<ActivityLog[]>(`/tickets/${ticketId}/activity`),
    enabled: !!ticketId,
    ...options,
  });
}

export function useCreateTicket(options?: UseMutationOptions<Ticket, Error, CreateTicketData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post<Ticket>('/tickets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
    },
    ...options,
  });
}

export function useUpdateTicket(options?: UseMutationOptions<Ticket, Error, { id: string; data: UpdateTicketData }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.put<Ticket>(`/tickets/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
    },
    ...options,
  });
}

export function useDeleteTicket(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete<void>(`/tickets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
    },
    ...options,
  });
}

export function useAddComment(options?: UseMutationOptions<Comment, Error, { ticketId: string; data: CommentData }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, data }) => api.post<Comment>(`/tickets/${ticketId}/comments`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.ticketId] });
    },
    ...options,
  });
}

export function useUser(options?: UseQueryOptions<User>) {
  const username = auth.getUser()?.username;
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => api.get<User>(`/users/username/${encodeURIComponent(username || '')}`),
    enabled: !!username,
    ...options,
  });
}

export function useUpdateProfile(options?: UseMutationOptions<User, Error, Partial<User>>) {
  const queryClient = useQueryClient();
  const userId = auth.getUser()?.id;
  return useMutation({
    mutationFn: (data) => api.put<User>(`/users/${userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    ...options,
  });
}

export function useApiErrors(
  page = 1,
  limit = 20,
  filters?: Record<string, unknown>,
  options?: UseQueryOptions<PaginatedResponse<ApiError>>
) {
  return useQuery({
    queryKey: queryKeys.apiErrors(page, limit, filters),
    queryFn: () =>
      api.get<PaginatedResponse<ApiError>>('/api-errors', {
        params: { page, limit, ...filters },
      }),
    ...options,
  });
}
