import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Pencil, Plus, Search, Trash2, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateTicket,
  useDeleteTicket,
  useEvents,
  useLockTicket,
  useTicketStats,
  useTickets,
  useUpdateTicket,
  useUnlockTicket,
} from 'frontend-shared/hooks/useApi';
import { usePagedRows } from 'frontend-shared/hooks/usePagedRows';
import {
  PageHeader,
  Pager,
  QueryState,
  StatCard,
  Table,
  Td,
  Th,
} from 'frontend-shared/components/QueryState';
import { Badge, Button, Card, ConfirmDialog, Input, Modal, SelectField } from 'frontend-shared/components/ui';
import { formatCurrency, formatDateTime, formatStatusLabel } from 'frontend-shared/utils';
import { auth } from 'frontend-shared/lib/auth';
import {
  TICKET_STATUSES,
  TICKET_TYPES,
  type Ticket,
  type TicketPayload,
} from 'frontend-shared/types/api';

/** Mirrors `TicketRequest`: eventId and seatNumber are @NotNull, price > 0. */
const ticketSchema = z.object({
  eventId: z.coerce.number({ invalid_type_error: 'Select an event' }).min(1, 'Select an event'),
  seatNumber: z.string().trim().min(1, 'Seat number is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  ticketType: z.enum(TICKET_TYPES),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const Inventory: React.FC = () => {
  const activeRole = auth.getUser()?.role;
  const canManageInventory = activeRole === 'TENANT_ADMIN';
  const tickets = useTickets();
  const ticketStats = useTicketStats();
  const events = useEvents();
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const lockTicket = useLockTicket();
  const unlockTicket = useUnlockTicket();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [eventFilter, setEventFilter] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingTicket, setEditingTicket] = React.useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Ticket | null>(null);

  const openCreate = () => {
    setEditingTicket(null);
    setFormOpen(true);
  };

  const eventTitleById = React.useMemo(() => {
    const map = new Map<number, string>();
    (events.data ?? []).forEach((event) => map.set(event.id, event.title));
    return map;
  }, [events.data]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return (tickets.data ?? []).filter((ticket) => {
      const matchesTerm =
        !term ||
        ticket.seatNumber?.toLowerCase().includes(term) ||
        eventTitleById.get(ticket.eventId)?.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || ticket.ticketStatus === statusFilter;
      const matchesEvent = !eventFilter || String(ticket.eventId) === eventFilter;
      return matchesTerm && matchesStatus && matchesEvent;
    });
  }, [tickets.data, search, statusFilter, eventFilter, eventTitleById]);

  const paged = usePagedRows(filtered, 10);
  const byStatus = ticketStats.data?.byStatus ?? {};

  return (
    <>
      <PageHeader
        title="Ticket inventory"
        description={canManageInventory
          ? 'Seats are one row each. Locked seats show the holder and expiry.'
          : activeRole === 'ADMIN'
            ? 'Platform-wide read-only view. Open a workspace from Users to manage inventory with an audited session.'
            : 'View ticket inventory in your workspace.'}
        actions={
          canManageInventory ? (
            <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
              Add seat
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Seats" value={ticketStats.data?.total ?? tickets.data?.length ?? 0} />
        <StatCard label="Available" value={byStatus.AVAILABLE ?? 0} tone="good" />
        <StatCard label="Locked" value={byStatus.LOCKED ?? 0} tone="warn" />
        <StatCard label="Sold" value={byStatus.SOLD ?? 0} />
      </div>

      <Card className="mb-4 p-3 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by seat or event"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={Search}
              aria-label="Search tickets"
            />
          </div>
          <SelectField
            value={eventFilter}
            onChange={setEventFilter}
            ariaLabel="Filter by event"
            className="w-full px-3 py-2 text-[13px] lg:w-48"
            options={[
              { value: '', label: 'All events' },
              ...(events.data ?? []).map((event) => ({ value: String(event.id), label: event.title })),
            ]}
          />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter by status"
            className="w-full px-3 py-2 text-[13px] lg:w-44"
            options={[
              { value: '', label: 'All statuses' },
              ...TICKET_STATUSES.map((status) => ({ value: status, label: formatStatusLabel(status) })),
            ]}
          />
        </div>
      </Card>

      <QueryState
        isLoading={tickets.isLoading}
        error={tickets.error}
        isEmpty={filtered.length === 0}
        onRetry={() => void tickets.refetch()}
        emptyTitle={search || statusFilter || eventFilter ? 'No seats match your filters' : 'No seats yet'}
        emptyDescription="Add a seat to make it purchasable."
        emptyAction={canManageInventory ? (
          <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
            Add seat
          </Button>
        ) : undefined}
      >
        <Table>
          <thead>
            <tr>
              <Th>Seat</Th>
              <Th>Event</Th>
              <Th>Type</Th>
              <Th>Price</Th>
              <Th>Status</Th>
              <Th>Locked by</Th>
              <Th>Locked until</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paged.visible.map((ticket) => (
              <tr key={ticket.id} className="border-t border-[#3c3f41]">
                <Td className="font-medium">{ticket.seatNumber}</Td>
                <Td className="text-[#9da0a8]">
                  {eventTitleById.get(ticket.eventId) ?? `Event #${ticket.eventId}`}
                </Td>
                <Td className="text-[#9da0a8]">{ticket.ticketType ?? '-'}</Td>
                <Td className="font-medium">{formatCurrency(ticket.price)}</Td>
                <Td>
                  <Badge status={ticket.ticketStatus ?? 'UNKNOWN'} />
                </Td>
                <Td className="text-[#9da0a8]">{ticket.lockedBy ?? '-'}</Td>
                <Td className="whitespace-nowrap text-[#9da0a8]">
                  {ticket.lockedUntil ? formatDateTime(ticket.lockedUntil) : '-'}
                </Td>
                <Td className="whitespace-nowrap text-[#9da0a8]">
                  {formatDateTime(ticket.createdAt)}
                </Td>
                <Td className="whitespace-nowrap text-[#9da0a8]">
                  {formatDateTime(ticket.updatedAt)}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    {canManageInventory && ticket.ticketStatus === 'AVAILABLE' && <button
                      type="button"
                      title="Lock seat"
                      aria-label={`Lock seat ${ticket.seatNumber}`}
                      disabled={lockTicket.isPending}
                      onClick={() =>
                        lockTicket.mutate(ticket.id, {
                          onSuccess: () => toast.success(`Seat ${ticket.seatNumber} locked`),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335] disabled:opacity-40"
                    >
                      <Lock className="h-3.5 w-3.5" />
                    </button>}
                    {canManageInventory && ticket.ticketStatus === 'LOCKED' && <button
                      type="button"
                      title="Release lock"
                      aria-label={`Release lock on seat ${ticket.seatNumber}`}
                      disabled={unlockTicket.isPending}
                      onClick={() =>
                        unlockTicket.mutate(ticket.id, {
                          onSuccess: () => toast.success(`Seat ${ticket.seatNumber} released`),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335] disabled:opacity-40"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                    </button>}
                    {canManageInventory && ticket.ticketStatus === 'AVAILABLE' && <button
                      type="button"
                      title="Edit seat"
                      aria-label={`Edit seat ${ticket.seatNumber}`}
                      onClick={() => {
                        setEditingTicket(ticket);
                        setFormOpen(true);
                      }}
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>}
                    {canManageInventory && <button
                      type="button"
                      title={ticket.ticketStatus === 'LOCKED' ? 'Release the lock before deleting' : ticket.ticketStatus === 'SOLD' ? 'Sold seats cannot be deleted' : 'Delete seat'}
                      aria-label={`Delete seat ${ticket.seatNumber}`}
                      disabled={ticket.ticketStatus === 'LOCKED' || ticket.ticketStatus === 'SOLD'}
                      onClick={() => setDeleteTarget(ticket)}
                      className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          onChange={paged.setPage}
        />
      </QueryState>

      {formOpen && (
        <TicketFormModal
          ticket={editingTicket}
          events={(events.data ?? []).map((event) => ({ id: event.id, title: event.title }))}
          onClose={() => {
            setFormOpen(false);
            setEditingTicket(null);
          }}
          onSubmit={(payload) => {
            if (editingTicket) {
              updateTicket.mutate({ id: editingTicket.id, payload }, {
                onSuccess: () => {
                  toast.success('Seat updated');
                  setFormOpen(false);
                  setEditingTicket(null);
                },
                onError: (e) => toast.error(e.message),
              });
              return;
            }
            createTicket.mutate(payload, {
              onSuccess: () => {
                toast.success('Seat added');
                setFormOpen(false);
              },
              onError: (e) => toast.error(e.message),
            });
          }}
          pending={createTicket.isPending || updateTicket.isPending}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTicket.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success('Seat deleted');
              setDeleteTarget(null);
            },
            onError: (e) => {
              toast.error(e.message);
              setDeleteTarget(null);
            },
          });
        }}
        title="Delete seat"
        description={`Seat ${deleteTarget?.seatNumber ?? ''} will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleteTicket.isPending}
      />
    </>
  );
};

const TicketFormModal: React.FC<{
  ticket: Ticket | null;
  events: { id: number; title: string }[];
  onClose: () => void;
  onSubmit: (payload: TicketPayload) => void;
  pending: boolean;
}> = ({ ticket, events, onClose, onSubmit, pending }) => {
  const eventOptions = ticket && !events.some((event) => event.id === ticket.eventId)
    ? [...events, { id: ticket.eventId, title: `Event #${ticket.eventId}` }]
    : events;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      eventId: ticket?.eventId,
      seatNumber: ticket?.seatNumber ?? '',
      price: ticket?.price ?? 0,
      ticketType: ticket?.ticketType ?? 'STANDARD',
    },
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={ticket ? `Edit seat ${ticket.seatNumber}` : 'Add seat'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="ticket-form" loading={pending} disabled={eventOptions.length === 0}>
            {ticket ? 'Save changes' : 'Add seat'}
          </Button>
        </>
      }
    >
      {eventOptions.length === 0 ? (
        <p className="text-[13px] text-[#9da0a8]">Create an event first - a seat must belong to one.</p>
      ) : (
        <form id="ticket-form" onSubmit={handleSubmit((values) => onSubmit(values))} className="space-y-3">
          <div>
            <label htmlFor="ticket-event" className="mb-1.5 block text-xs font-medium text-[#c4c7ce]">
              Event
            </label>
            <Controller
              control={control}
              name="eventId"
              render={({ field }) => (
                <SelectField
                  id="ticket-event"
                  value={field.value ? String(field.value) : ''}
                  onChange={(value) => field.onChange(value ? Number(value) : '')}
                  disabled={pending || ticket !== null}
                  options={[
                    { value: '', label: 'Select an event' },
                    ...eventOptions.map((event) => ({ value: String(event.id), label: event.title })),
                  ]}
                />
              )}
            />
            {errors.eventId && (
              <p className="mt-1 text-[11px] text-rose-400">{errors.eventId.message}</p>
            )}
            {ticket && <p className="mt-1 text-[11px] text-[#7d8188]">Event assignment cannot be changed after creation.</p>}
          </div>
          <Input
            label="Seat number"
            placeholder="A-12"
            error={errors.seatNumber?.message}
            {...register('seatNumber')}
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register('price')}
          />
          <div>
            <label htmlFor="ticket-type" className="mb-1.5 block text-xs font-medium text-[#c4c7ce]">
              Tier
            </label>
            <Controller
              control={control}
              name="ticketType"
              render={({ field }) => (
                <SelectField
                  id="ticket-type"
                  value={field.value ?? 'STANDARD'}
                  onChange={field.onChange}
                  disabled={pending}
                  options={TICKET_TYPES.map((type) => ({ value: type, label: type }))}
                />
              )}
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default Inventory;
