import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUp, Lock, Pencil, Plus, Search, Ticket as TicketIcon, Trash2, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCreateTicket,
  useCreateTickets,
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
import { formatCurrency, formatDateTime, formatStatusLabel, parseTicketCsv } from 'frontend-shared/utils';
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
  seatNumber: z.string().trim().min(1, 'Ticket number is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  ticketType: z.enum(TICKET_TYPES),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const Inventory: React.FC = () => {
  const activeRole = auth.getUser()?.role;
  const canManageInventory = activeRole === 'USER' || activeRole === 'TENANT_ADMIN';
  const tickets = useTickets();
  const ticketStats = useTicketStats();
  const events = useEvents();
  const createTicket = useCreateTicket();
  const createTickets = useCreateTickets();
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const lockTicket = useLockTicket();
  const unlockTicket = useUnlockTicket();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [eventFilter, setEventFilter] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
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
          ? 'Tickets are one row each. Locked tickets show the holder and expiry.'
          : activeRole === 'ADMIN'
            ? 'Platform-wide read-only view. Open a workspace from Users to manage inventory with an audited session.'
            : 'View ticket inventory in your workspace.'}
        actions={
          canManageInventory ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" leftIcon={<FileUp className="h-3.5 w-3.5" />} onClick={() => setImportOpen(true)}>
                Import Tickets
              </Button>
              <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
                Create Ticket
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tickets" value={ticketStats.data?.total ?? tickets.data?.length ?? 0} />
        <StatCard label="Available" value={byStatus.AVAILABLE ?? 0} tone="good" />
        <StatCard label="Locked" value={byStatus.LOCKED ?? 0} tone="warn" />
        <StatCard label="Sold" value={byStatus.SOLD ?? 0} />
      </div>

      <Card className="mb-4 p-3 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by ticket or event"
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
        emptyTitle={search || statusFilter || eventFilter ? 'No tickets match your filters' : 'No tickets yet'}
        emptyDescription="Create a ticket to make it purchasable."
        emptyAction={canManageInventory ? (
          <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
            Create Ticket
          </Button>
        ) : undefined}
      >
        <Table>
          <thead>
            <tr>
              <Th>Ticket</Th>
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
                      title="Lock ticket"
                      aria-label={`Lock ticket ${ticket.seatNumber}`}
                      disabled={lockTicket.isPending}
                      onClick={() =>
                        lockTicket.mutate(ticket.id, {
                          onSuccess: () => toast.success(`Ticket ${ticket.seatNumber} locked`),
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
                      aria-label={`Release lock on ticket ${ticket.seatNumber}`}
                      disabled={unlockTicket.isPending}
                      onClick={() =>
                        unlockTicket.mutate(ticket.id, {
                          onSuccess: () => toast.success(`Ticket ${ticket.seatNumber} released`),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335] disabled:opacity-40"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                    </button>}
                    {canManageInventory && ticket.ticketStatus === 'AVAILABLE' && <button
                      type="button"
                      title="Edit ticket"
                      aria-label={`Edit ticket ${ticket.seatNumber}`}
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
                      title={ticket.ticketStatus === 'LOCKED' ? 'Release the lock before deleting' : ticket.ticketStatus === 'SOLD' ? 'Sold tickets cannot be deleted' : 'Delete ticket'}
                      aria-label={`Delete ticket ${ticket.seatNumber}`}
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
                  toast.success('Ticket updated');
                  setFormOpen(false);
                  setEditingTicket(null);
                },
                onError: (e) => toast.error(e.message),
              });
              return;
            }
            createTicket.mutate(payload, {
              onSuccess: () => {
                toast.success('Ticket created');
                setFormOpen(false);
              },
              onError: (e) => toast.error(e.message),
            });
          }}
          pending={createTicket.isPending || updateTicket.isPending}
        />
      )}

      {importOpen && (
        <TicketImportModal
          onClose={() => setImportOpen(false)}
          pending={createTickets.isPending}
          onSubmit={(payloads) => createTickets.mutate(payloads, {
            onSuccess: (created) => {
              toast.success(`${created.length} ticket${created.length === 1 ? '' : 's'} imported`);
              setImportOpen(false);
            },
            onError: (error) => toast.error(error.message),
          })}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTicket.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success('Ticket deleted');
              setDeleteTarget(null);
            },
            onError: (e) => {
              toast.error(e.message);
              setDeleteTarget(null);
            },
          });
        }}
        title="Delete ticket"
        description={`Ticket ${deleteTarget?.seatNumber ?? ''} will be permanently removed.`}
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
      title={ticket ? `Edit ticket ${ticket.seatNumber}` : 'Create Ticket'}
      className="ticket-form-modal"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="ticket-form" loading={pending} disabled={eventOptions.length === 0}>
            {ticket ? 'Save changes' : 'Create Ticket'}
          </Button>
        </>
      }
    >
      {eventOptions.length === 0 ? (
        <p className="text-[13px] text-[#9da0a8]">Create an event first - a ticket must belong to one.</p>
      ) : (
        <form id="ticket-form" onSubmit={handleSubmit((values) => onSubmit(values))} className="space-y-5">
          {!ticket && (
            <div className="ticket-form-hero">
              <div className="ticket-form-hero-icon"><TicketIcon className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-[#f1ede5]">Set up a sellable ticket</p>
                <p className="mt-1 text-xs leading-5 text-[#a9a59d]">Choose an event, give the seat a unique label, then set its tier and price.</p>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
            label="Ticket label"
            placeholder="GA-01"
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
          </div>
          <p className="ticket-form-note">Use a unique label such as <strong>GA-01</strong>, <strong>VIP-02</strong>, or <strong>B-14</strong>. The label is saved exactly as entered and is not auto-generated.</p>
        </form>
      )}
    </Modal>
  );
};


const TicketImportModal: React.FC<{
  onClose: () => void;
  onSubmit: (payloads: TicketPayload[]) => void;
  pending: boolean;
}> = ({ onClose, onSubmit, pending }) => {
  const [csv, setCsv] = React.useState('eventId,ticketNumber,price,ticketType\n101,A-01,25,STANDARD');
  const [errors, setErrors] = React.useState<string[]>([]);

  const submit = () => {
    const result = parseTicketCsv(csv);
    if (result.errors.length > 0) { setErrors(result.errors); return; }
    onSubmit(result.payloads);
  };

  return (
    <Modal open onClose={onClose} title="Import Tickets (CSV)" footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
        <Button onClick={submit} loading={pending} disabled={!csv.trim()}>Import Tickets</Button>
      </>
    }>
      <div className="space-y-3">
        <p className="text-[12px] leading-5 text-[#9da0a8]">Use one row per ticket. Required columns: <code>eventId,ticketNumber,price</code>. Optional: <code>ticketType</code>.</p>
        <input type="file" accept=".csv,text/csv" disabled={pending} onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void file.text().then((value) => { setCsv(value); setErrors([]); });
        }} className="block w-full text-xs text-[#9da0a8] file:mr-3 file:rounded-md file:border-0 file:bg-[#313335] file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#dfe1e5]" />
        <textarea value={csv} onChange={(event) => { setCsv(event.target.value); setErrors([]); }} disabled={pending} rows={8} spellCheck={false} className="w-full rounded-lg border border-[#454a52] bg-[#141416] px-3 py-2 font-mono text-xs text-[#dfe1e5] outline-none focus:border-[#6fa6ff]" aria-label="Ticket CSV" />
        {errors.length > 0 && <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300"><p className="font-semibold">Fix these rows before importing:</p><ul className="mt-1 list-inside list-disc">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
      </div>
    </Modal>
  );
};

export default Inventory;
