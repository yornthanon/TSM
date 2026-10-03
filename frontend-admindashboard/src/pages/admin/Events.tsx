import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Check, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useApproveEvent,
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useRejectEvent,
  useUpdateEvent,
} from '../../hooks/useApi';
import { usePagedRows } from '../../hooks/usePagedRows';
import {
  PageHeader,
  Pager,
  QueryState,
  Table,
  Td,
  Th,
} from '../../components/QueryState';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Input,
  Modal,
} from '../../components/ui';
import { formatCurrency, formatDateTime, toDateTimeLocalValue } from '../../utils';
import { EVENT_STATUSES, EVENT_TYPES, type Event, type EventPayload } from '../../types/api';

/**
 * Mirrors the backend `EventRequest` constraints: title is @NotBlank and capped
 * at 255 characters, and the rest are optional. `basePrice` must be positive
 * because it seeds ticket pricing.
 */
const eventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Max 255 characters'),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  location: z.string().trim().max(255).optional().or(z.literal('')),
  imageUrl: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')),
  eventDate: z.string().optional().or(z.literal('')),
  basePrice: z.coerce.number().min(0, 'Cannot be negative').optional(),
  capacity: z.coerce.number().int().min(0, 'Cannot be negative').optional(),
  eventType: z.enum(EVENT_TYPES).optional(),
  status: z.enum(EVENT_STATUSES).optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const EMPTY_FORM: EventFormValues = {
  title: '',
  description: '',
  location: '',
  imageUrl: '',
  eventDate: '',
  basePrice: 0,
  capacity: 0,
  eventType: 'CONCERT',
  status: 'DRAFT',
};

const Events: React.FC = () => {
  const events = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const approveEvent = useApproveEvent();
  const rejectEvent = useRejectEvent();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [editing, setEditing] = React.useState<Event | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Event | null>(null);

  const filtered = React.useMemo(() => {
    const rows = events.data ?? [];
    const term = search.trim().toLowerCase();
    return rows.filter((event) => {
      const matchesTerm =
        !term ||
        event.title?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term) ||
        event.eventType?.toLowerCase().includes(term);
      // The backend does not default status, so an unset event matches "all"
      // but never a specific status filter.
      const matchesStatus = !statusFilter || (event.status ?? 'UNSET') === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [events.data, search, statusFilter]);

  const paged = usePagedRows(filtered, 10);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Events"
        description="Create, publish and moderate events across the platform."
        actions={
          <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
            New event
          </Button>
        }
      />

      <Card className="mb-4 p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by title, location or type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={Search}
              aria-label="Search events"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-[#3c3f41] bg-white px-3 py-2 text-[13px] text-[#c4c7ce]"
          >
            <option value="">All statuses</option>
            {EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <QueryState
        isLoading={events.isLoading}
        error={events.error}
        isEmpty={filtered.length === 0}
        onRetry={() => void events.refetch()}
        emptyTitle={search || statusFilter ? 'No events match your filters' : 'No events yet'}
        emptyDescription={
          search || statusFilter ? 'Try a different search term.' : 'Create your first event to get started.'
        }
        emptyAction={
          search || statusFilter ? undefined : (
            <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openCreate}>
              New event
            </Button>
          )
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Event</Th>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Capacity</Th>
              <Th>From</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paged.visible.map((event) => (
              <tr key={event.id} className="border-t border-[#3c3f41]">
                <Td>
                  <Link
                    to={`/admin/events/${event.id}`}
                    className="font-medium text-[#d7dae0] hover:text-[#3574f0] hover:underline"
                  >
                    {event.title}
                  </Link>
                  {event.location && (
                    <p className="text-[11px] text-[#9da0a8]">{event.location}</p>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-[#9da0a8]">
                  {formatDateTime(event.eventDate)}
                </Td>
                <Td className="text-[#9da0a8]">{event.eventType ?? '-'}</Td>
                <Td className="text-[#9da0a8]">{event.capacity ?? '-'}</Td>
                <Td className="font-medium">{formatCurrency(event.basePrice)}</Td>
                <Td>
                  <Badge status={event.status ?? 'UNSET'} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/admin/events/${event.id}`}
                      title="View inventory"
                      aria-label={`View ${event.title}`}
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      title="Edit"
                      aria-label={`Edit ${event.title}`}
                      onClick={() => openEdit(event)}
                      className="rounded-md p-1.5 text-[#9da0a8] hover:bg-[#313335]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Approve"
                      aria-label={`Approve ${event.title}`}
                      disabled={approveEvent.isPending}
                      onClick={() =>
                        approveEvent.mutate(event.id, {
                          onSuccess: () => toast.success(`"${event.title}" approved`),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Reject"
                      aria-label={`Reject ${event.title}`}
                      disabled={rejectEvent.isPending}
                      onClick={() =>
                        rejectEvent.mutate(event.id, {
                          onSuccess: () => toast.success(`"${event.title}" rejected`),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                      className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      aria-label={`Delete ${event.title}`}
                      onClick={() => setDeleteTarget(event)}
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
        <EventFormModal
          event={editing}
          onClose={() => setFormOpen(false)}
          onSubmit={(payload) => {
            if (editing) {
              updateEvent.mutate(
                { id: editing.id, payload },
                {
                  onSuccess: () => {
                    toast.success('Event updated');
                    setFormOpen(false);
                  },
                  onError: (e) => toast.error(e.message),
                }
              );
            } else {
              createEvent.mutate(payload, {
                onSuccess: () => {
                  toast.success('Event created');
                  setFormOpen(false);
                },
                onError: (e) => toast.error(e.message),
              });
            }
          }}
          pending={createEvent.isPending || updateEvent.isPending}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteEvent.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success('Event deleted');
              setDeleteTarget(null);
            },
            onError: (e) => {
              toast.error(e.message);
              setDeleteTarget(null);
            },
          });
        }}
        title="Delete event"
        description={`"${deleteTarget?.title ?? ''}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteEvent.isPending}
      />
    </>
  );
};

const EventFormModal: React.FC<{
  event: Event | null;
  onClose: () => void;
  onSubmit: (payload: EventPayload) => void;
  pending: boolean;
}> = ({ event, onClose, onSubmit, pending }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title ?? '',
          description: event.description ?? '',
          location: event.location ?? '',
          imageUrl: event.imageUrl ?? '',
          eventDate: toDateTimeLocalValue(event.eventDate),
          basePrice: event.basePrice ?? 0,
          capacity: event.capacity ?? 0,
          eventType: (event.eventType ?? 'CONCERT') as EventFormValues['eventType'],
          status: (event.status ?? 'DRAFT') as EventFormValues['status'],
        }
      : EMPTY_FORM,
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={event ? `Edit "${event.title}"` : 'Create event'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="event-form" loading={pending}>
            {event ? 'Save changes' : 'Create event'}
          </Button>
        </>
      }
    >
      <form id="event-form" onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))} className="space-y-3">
        <Input
          label="Title"
          placeholder="Spring Symphony"
          error={errors.title?.message}
          {...register('title')}
        />
        <div>
          <label htmlFor="event-description" className="mb-1.5 block text-xs font-medium text-[#c4c7ce]">
            Description
          </label>
          <textarea
            id="event-description"
            rows={3}
            className="w-full rounded-lg border border-[#3c3f41] px-3 py-2 text-[13px] text-[#d7dae0] outline-none focus:border-[#c4b5fd] focus:ring-2 focus:ring-[#3574f0]/15"
            placeholder="What is this event about?"
            {...register('description')}
          />
        </div>
        <Input
          label="Location"
          placeholder="National Theatre, Hall A"
          error={errors.location?.message}
          {...register('location')}
        />
        <Input
          label="Image URL"
          placeholder="https://..."
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />
        <Input
          label="Date & time"
          type="datetime-local"
          error={errors.eventDate?.message}
          {...register('eventDate')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Base price"
            type="number"
            step="0.01"
            min="0"
            error={errors.basePrice?.message}
            {...register('basePrice')}
          />
          <Input
            label="Capacity"
            type="number"
            step="1"
            min="0"
            error={errors.capacity?.message}
            {...register('capacity')}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="event-type" className="mb-1.5 block text-xs font-medium text-[#c4c7ce]">
              Type
            </label>
            <select
              id="event-type"
              className="w-full rounded-lg border border-[#3c3f41] bg-white px-3 py-2 text-[13px]"
              {...register('eventType')}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="event-status" className="mb-1.5 block text-xs font-medium text-[#c4c7ce]">
              Status
            </label>
            <select
              id="event-status"
              className="w-full rounded-lg border border-[#3c3f41] bg-white px-3 py-2 text-[13px]"
              {...register('status')}
            >
              {EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

/** Empty strings become null so the backend stores them as unset, not "". */
function toPayload(values: EventFormValues): EventPayload {
  const optional = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };
  return {
    title: values.title.trim(),
    description: optional(values.description),
    location: optional(values.location),
    imageUrl: optional(values.imageUrl),
    eventDate: values.eventDate ? values.eventDate : null,
    basePrice: values.basePrice ?? null,
    capacity: values.capacity ?? null,
    eventType: values.eventType ?? null,
    status: values.status ?? null,
  };
}

export default Events;
