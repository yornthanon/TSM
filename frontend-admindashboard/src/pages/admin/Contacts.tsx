import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2, MailOpen } from 'lucide-react';
import { useTickets, useDeleteTicket, useUpdateTicket } from '../../hooks/useApi';
import { Card, Skeleton, EmptyState, ConfirmDialog, Button, Input, Modal, Badge } from '../../components/ui';
import { formatDateTime, truncate } from '../../utils';
import type { Ticket, TicketStatus } from '../../types/api';
import { toast } from 'sonner';

export const Contacts: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus>('open');
  const [viewContact, setViewContact] = useState<Ticket | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useTickets({ page, limit: 10, status: statusFilter || undefined, search: search || undefined });
  const contacts = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const deleteTicket = useDeleteTicket({
    onSuccess: () => {
      toast.success('Ticket deleted successfully');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: () => toast.error('Failed to delete ticket'),
  });

  const updateTicket = useUpdateTicket({
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (error) return <div className="text-center py-12 text-red-600">Failed to load contacts.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="text-gray-500 mt-1">Manage incoming contact messages.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as TicketStatus); setPage(1); }}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
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
        ) : contacts.length === 0 ? (
          <EmptyState title="No contacts" description="Inbox is empty." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-medium text-gray-500">Name</th>
                  <th className="pb-3 font-medium text-gray-500">Email</th>
                  <th className="pb-3 font-medium text-gray-500">Preview</th>
                  <th className="pb-3 font-medium text-gray-500">Date</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((contact: Ticket) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{contact.customerName}</td>
                    <td className="py-3 text-gray-600">{contact.customerEmail}</td>
                    <td className="py-3 text-gray-600">{truncate(contact.description, 50)}</td>
                    <td className="py-3 text-gray-600">{formatDateTime(contact.createdAt)}</td>
                    <td className="py-3"><Badge status={contact.status}>{contact.status.replace('_', ' ')}</Badge></td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewContact(contact)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateTicket.mutate({ id: contact.id, data: { status: 'in_progress' } })}>
                          <MailOpen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(contact.id)}>
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

      <Modal open={!!viewContact} onClose={() => setViewContact(null)} title="Contact Message">
        {viewContact && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                <p className="font-medium text-gray-900 mt-1">{viewContact.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                <p className="font-medium text-gray-900 mt-1">{viewContact.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Subject</p>
                <p className="font-medium text-gray-900 mt-1">{viewContact.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                <p className="font-medium text-gray-900 mt-1">{formatDateTime(viewContact.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Message</p>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{viewContact.description}</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Badge status={viewContact.status}>{viewContact.status.replace('_', ' ')}</Badge>
            </div>
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
