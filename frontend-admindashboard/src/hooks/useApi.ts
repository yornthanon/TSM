import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  Project,
  ContactMessage,
  ApiError,
  PaginatedResponse,
  DashboardStats,
  ActivityItem,
  ChartDataPoint,
  ErrorStats,
  User,
  ContactFormData,
} from '../types/api';

export const queryKeys = {
  projects: (page?: number, limit?: number, status?: string, search?: string) =>
    ['projects', { page, limit, status, search }] as const,
  project: (id: string) => ['project', id] as const,
  contacts: (page?: number, limit?: number, status?: string, search?: string) =>
    ['contacts', { page, limit, status, search }] as const,
  contact: (id: string) => ['contact', id] as const,
  apiErrors: (page?: number, limit?: number, filters?: Record<string, unknown>) =>
    ['apiErrors', { page, limit, filters }] as const,
  apiError: (id: string) => ['apiError', id] as const,
  dashboardStats: () => ['dashboardStats'] as const,
  activity: (limit?: number) => ['activity', { limit }] as const,
  requestsChart: (period?: string) => ['requestsChart', { period }] as const,
  errorRateChart: (period?: string) => ['errorRateChart', { period }] as const,
  errorStats: (period?: string) => ['errorStats', { period }] as const,
  user: () => ['user'] as const,
};

export function useProjects(
  page = 1,
  limit = 10,
  status?: string,
  search?: string,
  options?: UseQueryOptions<PaginatedResponse<Project>>
) {
  return useQuery({
    queryKey: queryKeys.projects(page, limit, status, search),
    queryFn: () =>
      api.get<PaginatedResponse<Project>>('/projects', {
        params: { page, limit, status, search },
      }),
    ...options,
  });
}

export function useProject(id: string, options?: UseQueryOptions<Project>) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCreateProject(
  options?: UseMutationOptions<Project, Error, Partial<Project>>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post<Project>('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    ...options,
  });
}

export function useUpdateProject(
  options?: UseMutationOptions<Project, Error, { id: string; data: Partial<Project> }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.put<Project>(`/projects/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
    ...options,
  });
}

export function useDeleteProject(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete<void>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    ...options,
  });
}

export function useContacts(
  page = 1,
  limit = 10,
  status?: string,
  search?: string,
  options?: UseQueryOptions<PaginatedResponse<ContactMessage>>
) {
  return useQuery({
    queryKey: queryKeys.contacts(page, limit, status, search),
    queryFn: () =>
      api.get<PaginatedResponse<ContactMessage>>('/contacts', {
        params: { page, limit, status, search },
      }),
    ...options,
  });
}

export function useContact(id: string, options?: UseQueryOptions<ContactMessage>) {
  return useQuery({
    queryKey: queryKeys.contact(id),
    queryFn: () => api.get<ContactMessage>(`/contacts/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useUpdateContactStatus(
  options?: UseMutationOptions<ContactMessage, Error, { id: string; status: ContactMessage['status'] }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.patch<ContactMessage>(`/contacts/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.id] });
    },
    ...options,
  });
}

export function useDeleteContact(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete<void>(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
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

export function useApiError(id: string, options?: UseQueryOptions<ApiError>) {
  return useQuery({
    queryKey: queryKeys.apiError(id),
    queryFn: () => api.get<ApiError>(`/api-errors/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useDashboardStats(options?: UseQueryOptions<DashboardStats>) {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
    ...options,
  });
}

export function useActivity(limit = 10, options?: UseQueryOptions<ActivityItem[]>) {
  return useQuery({
    queryKey: queryKeys.activity(limit),
    queryFn: () => api.get<ActivityItem[]>('/dashboard/activity', { params: { limit } }),
    ...options,
  });
}

export function useRequestsChart(period = '7d', options?: UseQueryOptions<ChartDataPoint[]>) {
  return useQuery({
    queryKey: queryKeys.requestsChart(period),
    queryFn: () => api.get<ChartDataPoint[]>('/dashboard/charts/requests', { params: { period } }),
    ...options,
  });
}

export function useErrorRateChart(period = '7d', options?: UseQueryOptions<ChartDataPoint[]>) {
  return useQuery({
    queryKey: queryKeys.errorRateChart(period),
    queryFn: () => api.get<ChartDataPoint[]>('/dashboard/charts/error-rate', { params: { period } }),
    ...options,
  });
}

export function useErrorStats(period = '7d', options?: UseQueryOptions<ErrorStats>) {
  return useQuery({
    queryKey: queryKeys.errorStats(period),
    queryFn: () => api.get<ErrorStats>('/dashboard/stats/errors', { params: { period } }),
    ...options,
  });
}

export function useSubmitContact(
  options?: UseMutationOptions<void, Error, ContactFormData>
) {
  return useMutation({
    mutationFn: (data) => api.post<void>('/contact', data),
    ...options,
  });
}

export function useUser(options?: UseQueryOptions<User>) {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => api.get<User>('/user/profile'),
    ...options,
  });
}

export function useUpdateProfile(
  options?: UseMutationOptions<User, Error, Partial<User>>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.put<User>('/user/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    ...options,
  });
}