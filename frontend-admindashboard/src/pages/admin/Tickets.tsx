import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Filter, Eye } from 'lucide-react';
import { useTickets, useCreateTicket, useUpdateTicket, useDeleteTicket } from '../../hooks/useApi';
import { Card, Skeleton, EmptyState, ConfirmDialog, Button, Input, Modal, Badge, ErrorState } from '../../components/ui';
import { cn, truncate, formatRelativeTime, formatDateTime, getPriorityColor } from '../../utils';
import type { Ticket, TicketStatus, TicketPriority, CreateTicketData, UpdateTicketData } from '../../types/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.string().min(1, 'Category is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email'),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const statuses: TicketStatus[] = ['open', 'in_progress', 'review', 'resolved', 'closed'];
const priorities: TicketPriority[] = ['critical', 'high', 'medium', 'low'];

export const Tickets: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);

  const { data, isLoading, error, refetch } = useTickets({
    page,
    limit: 10,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    search: search || undefined,
  });
  const tickets = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const createTicket = useCreateTicket({
    onSuccess: () => {
      toast.success('Ticket created successfully');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: () => toast.error('Failed to create ticket'),
  });

  const updateTicket = useUpdateTicket({
    onSuccess: () => {
      toast.success('Ticket updated successfully');
      setModalOpen(false);
      setEditingTicket(null);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: () => toast.error('Failed to update ticket'),
  });

  const deleteTicket = useDeleteTicket({
    onSuccess: () => {
      toast.success('Ticket deleted successfully');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: () => toast.error('Failed to delete ticket'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ticketSchema),
  });

  const openCreate = () => {
    setEditingTicket(null);
    reset({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      customerName: '',
      customerEmail: '',
      assigneeId: '',
      dueDate: '',
      tags: '',
    });
    setModalOpen(true);
  };

  const openEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    reset({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      category: ticket.category,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      assigneeId: ticket.assigneeId || '',
      dueDate: ticket.dueDate || '',
      tags: ticket.tags.join(', '),
    });
    setModalOpen(true);
  };

  const onSubmit = (data: TicketFormData) => {
    const payload = {
      ...data,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    if (editingTicket) {
      updateTicket.mutate({ id: editingTicket.id, data: payload as UpdateTicketData });
    } else {
      createTicket.mutate(payload as CreateTicketData);
    }
  };

  if (error) return <ErrorState title="Failed to load tickets" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and track all support tickets.</p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Add Ticket</Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as TicketStatus | ''); setPage(1); }}
              className="input pl-10 appearance-none pr-8"
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as TicketPriority | ''); setPage(1); }}
            className="input"
          >
            <option value="">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                <Skeleton width="100%" height={20} />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState title="No tickets found" description="Create your first ticket to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-medium text-gray-500">Ticket ID</th>
                  <th className="pb-3 font-medium text-gray-500">Title</th>
                  <th className="pb-3 font-medium text-gray-500">Customer</th>
                  <th className="pb-3 font-medium text-gray-500">Priority</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Created</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono text-xs text-gray-500">#{ticket.ticketId}</td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{ticket.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{truncate(ticket.description, 60)}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{ticket.customerName}</td>
                    <td className="py-3">
                      <span className={cn('badge', getPriorityColor(ticket.priority))}>{ticket.priority}</span>
                    </td>
                    <td className="py-3"><Badge status={ticket.status}>{ticket.status.replace('_', ' ')}</Badge></td>
                    <td className="py-3 text-gray-600 text-xs">{formatRelativeTime(ticket.createdAt)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewTicket(ticket)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(ticket)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(ticket.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTicket(null); }}
        title={editingTicket ? 'Edit Ticket' : 'Create Ticket'}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setEditingTicket(null); }} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              {editingTicket ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <div className="w-full">
            <label className="label">Description</label>
            <textarea rows={3} className={cn('input resize-none', errors.description && 'border-red-500 focus:ring-red-500/50')} {...register('description')} />
            {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <label className="label">Priority</label>
              <select className="input" {...register('priority')}>
                {priorities.map((p) => (
                  <option key={p} value={p}>{p.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="label">Category</label>
              <select className="input" {...register('category')}>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Customer Name" error={errors.customerName?.message} {...register('customerName')} />
            <Input label="Customer Email" type="email" error={errors.customerEmail?.message} {...register('customerEmail')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Assignee ID" {...register('assigneeId')} />
            <Input label="Due Date" type="date" {...register('dueDate')} />
          </div>
          <Input label="Tags (comma separated)" placeholder="bug, urgent, backend" {...register('tags')} />
        </form>
      </Modal>

      <Modal open={!!viewTicket} onClose={() => setViewTicket(null)} title={`Ticket #${viewTicket?.ticketId}`}>
        {viewTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Title</p>
                <p className="font-medium text-gray-900 mt-1">{viewTicket.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <Badge status={viewTicket.status}>{viewTicket.status.replace('_', ' ')}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Priority</p>
                <span className={cn('badge', getPriorityColor(viewTicket.priority))}>{viewTicket.priority}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Customer</p>
                <p className="font-medium text-gray-900 mt-1">{viewTicket.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Category</p>
                <p className="font-medium text-gray-900 mt-1">{viewTicket.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                <p className="font-medium text-gray-900 mt-1">{formatDateTime(viewTicket.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{viewTicket.description}</p>
            </div>
            {viewTicket.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Tags</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {viewTicket.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteTicket.mutate(deleteId)}
        title="Delete Ticket"
        description="Are you sure you want to delete this ticket? This action cannot be undone."
        loading={deleteTicket.isPending}
      />
    </div>
  );
};
