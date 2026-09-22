import React, { useState } from 'react';
import { useTickets } from '../../hooks/useApi';
import { Card, Skeleton, EmptyState, Modal } from '../../components/ui';
import { cn, getPriorityColor, formatRelativeTime } from '../../utils';
import type { TicketStatus, TicketPriority } from '../../types/api';

const columns: { status: TicketStatus; label: string }[] = [
  { status: 'open', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'review', label: 'Review' },
  { status: 'resolved', label: 'Resolved' },
  { status: 'closed', label: 'Closed' },
];

export const KanbanBoard: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<null | { id: string; ticketId: string; title: string; description: string; priority: string; customerName: string; createdAt: string }>(null);
  const { data, isLoading, error } = useTickets({ page: 1, limit: 100 });

  const tickets = data?.data || [];

  if (error) return <div className="text-center py-12 text-red-600">Failed to load tickets.</div>;

  const getTicketsByStatus = (status: TicketStatus) => {
    return tickets.filter((t) => t.status === status);
  };

  const getPriorityOrder = (priority: TicketPriority) => {
    const order: Record<TicketPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[priority] ?? 4;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-gray-500 mt-1">Visualize and manage your ticket workflow.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {columns.map((col) => (
            <Card key={col.status} className="p-4">
              <Skeleton width="60%" height={20} className="mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} width="100%" height={80} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {columns.map((col) => {
            const columnTickets = getTicketsByStatus(col.status).sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
            return (
              <Card key={col.status} className="p-4 min-w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">{col.label}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{columnTickets.length}</span>
                </div>
                <div className="space-y-3">
                  {columnTickets.length === 0 ? (
                    <EmptyState title="No tickets" description="" />
                  ) : (
                    columnTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{ticket.title}</p>
                          <span className={cn('badge text-xs whitespace-nowrap', getPriorityColor(ticket.priority))}>{ticket.priority}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">#{ticket.ticketId}</span>
                          <span className="text-xs text-gray-400">{formatRelativeTime(ticket.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket?.title || 'Ticket Details'}>
        {selectedTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Ticket ID</p>
                <p className="font-medium text-gray-900 mt-1">#{selectedTicket.ticketId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Priority</p>
                <span className={cn('badge mt-1', getPriorityColor(selectedTicket.priority))}>{selectedTicket.priority}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Customer</p>
                <p className="font-medium text-gray-900 mt-1">{selectedTicket.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                <p className="font-medium text-gray-900 mt-1">{formatRelativeTime(selectedTicket.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
