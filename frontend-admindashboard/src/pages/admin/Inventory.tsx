import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Trash2, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateTicket,
  useDeleteTicket,
  useEvents,
  useTicketStats,
  useTickets,
  useUnlockTicket,
} from '../../hooks/useApi';
import { usePagedRows } from '../../hooks/usePagedRows';
import {
  PageHeader,
  Pager,
  QueryState,
  StatCard,
  Table,
  Td,
  Th,
} from '../../components/QueryState';
import { Badge, Button, Card, ConfirmDialog, Input, Modal } from '../../components/ui';
import { formatCurrency, formatDateTime } from '../../utils';
import {
  TICKET_STATUSES,
  TICKET_TYPES,
  type Ticket,
  type TicketPayload,
} from '../../types/api';

/** Mirrors `TicketRequest`: eventId and seatNumber are @NotNull, price > 0. */
const ticketSchema = z.object({
  eventId: z.coerce.number({ invalid_type_error: 'Select an event' }).min(1, 'Select an event'),
  seatNumber: z.string().trim().min(1, 'Seat number is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  ticketType: z.enum(TICKET_TYPES),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const Inventory: React.FC = () => {
  const tickets = useTickets();
  const ticketStats = useTicketStats();
  const events = useEvents();
  const createTicket = useCreateTicket();
  const deleteTicket = useDeleteTicket();
  const unlockTicket = useUnlockTicket();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [eventFilter, setEventFilter] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Ticket | null>(null);

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
        description="Seats are one row each. Locked seats show the holder and expiry."
        actions={
          <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setFormOpen(true)}>
            Add seat
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            aria-label="Filter by event"
            className="rounded-lg border border-[#e7e7eb] bg-white px-3 py-2 text-[13px] text-[#3d3d47]"
          >
            <option value="">All events</option>
            {(events.data ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-[#e7e7eb] bg-white px-3 py-2 text-[13px] text-[#3d3d47]"
          >
            <option value="">All statuses</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <QueryState
        isLoading={tickets.isLoading}
        error={tickets.error}
        isEmpty={filtered.length === 0}
        onRetry={() => void tickets.refetch()}
        emptyTitle={search || statusFilter || eventFilter ? 'No seats match your filters' : 'No seats yet'}
        emptyDescription="Add a seat to make it purchasable."
        emptyAction={
          <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setFormOpen(true)}>
            Add seat
          </Button>
        }
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
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paged.visible.map((ticket) => (
              <tr key={ticket.id} className="border-t border-[#f0f0f3]">
                <Td className="font-medium">{ticket.seatNumber}</Td>
                <Td className="text-[#777783]">
                  {eventTitleById.get(ticket.eventId) ?? `Event #${ticket.eventId}`}
                </Td>
                <Td className="text-[#777783]">{ticket.ticketType ?? '-'}</Td>
                <Td className="font-medium">{formatCurrency(ticket.price)}</Td>
                <Td>
                  <Badge status={ticket.ticketStatus ?? 'UNKNOWN'} />
                </Td>
                <Td className="text-[#777783]">{ticket.lockedBy ?? '-'}</Td>
                <Td className="whitespace-nowrap text-[#777783]">
                  {ticket.lockedUntil ? formatDateTime(ticket.lockedUntil) : '-'}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
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
                      className="rounded-md p-1.5 text-[#8b8b96] hover:bg-[#f5f5f7] disabled:opacity-40"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete seat"
                      aria-label={`Delete seat ${ticket.seatNumber}`}
                      onClick={() => setDeleteTarget(ticket)}
                      className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
          events={(events.data ?? []).map((event) => ({ id: event.id, title: event.title }))}
          onClose={() => setFormOpen(false)}
          onSubmit={(payload) =>
            createTicket.mutate(payload, {
              onSuccess: () => {
                toast.success('Seat added');
                setFormOpen(false);
              },
              onError: (e) => toast.error(e.message),
            })
          }
          pending={createTicket.isPending}
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
  events: { id: number; title: string }[];
  onClose: () => void;
  onSubmit: (payload: TicketPayload) => void;
  pending: boolean;
}> = ({ events, onClose, onSubmit, pending }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { ticketType: 'STANDARD', price: 0 },
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Add seat"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="ticket-form" loading={pending} disabled={events.length === 0}>
            Add seat
          </Button>
        </>
      }
    >
      {events.length === 0 ? (
        <p className="text-[13px] text-[#777783]">Create an event first - a seat must belong to one.</p>
      ) : (
        <form id="ticket-form" onSubmit={handleSubmit((values) => onSubmit(values))} className="space-y-3">
          <div>
            <label htmlFor="ticket-event" className="mb-1.5 block text-xs font-medium text-[#5c5c68]">
              Event
            </label>
            <select
              id="ticket-event"
              className="w-full rounded-lg border border-[#e7e7eb] bg-white px-3 py-2 text-[13px]"
              {...register('eventId')}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {errors.eventId && (
              <p className="mt-1 text-[11px] text-rose-600">{errors.eventId.message}</p>
            )}
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
            <label htmlFor="ticket-type" className="mb-1.5 block text-xs font-medium text-[#5c5c68]">
              Tier
            </label>
            <select
              id="ticket-type"
              className="w-full rounded-lg border border-[#e7e7eb] bg-white px-3 py-2 text-[13px]"
              {...register('ticketType')}
            >
              {TICKET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default Inventory;
