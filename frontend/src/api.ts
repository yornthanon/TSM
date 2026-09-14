const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export type EventItem = { id: number; name?: string; title?: string; description?: string; location?: string; eventDate?: string; date?: string; imageUrl?: string; status?: string }
export type Ticket = { id: number; name?: string; type?: string; price?: number; quantity?: number; availableQuantity?: number; eventId?: number }
export type Order = { id?: number; orderNumber?: string; reference?: string; status?: string; totalAmount?: number; tickets?: Ticket[] }

function unwrap<T>(payload: any): T {
  return (payload?.data ?? payload?.result ?? payload?.content ?? payload) as T
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }, ...options })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.error === true || payload?.success === false) throw new Error(payload?.message || payload?.errorMessage || 'សេវាកម្មមិនអាចប្រើបាននៅពេលនេះ')
  return unwrap<T>(payload)
}

export const api = {
  events: () => request<EventItem[]>('/api/v1/events'),
  event: (id: number) => request<EventItem>(`/api/v1/events/${id}`),
  tickets: () => request<Ticket[]>('/api/v1/tickets'),
  createOrder: (body: unknown) => request<Order>('/api/v1/orders/create', { method: 'POST', body: JSON.stringify(body) }),
}
export { API_BASE }
