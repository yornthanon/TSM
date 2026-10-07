import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useApproveEvent,
  useEvent,
  useOrders,
  useRejectEvent,
  useTickets,
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
import { Badge, Button, Card, ErrorState, Skeleton } from '../../components/ui';
import { formatCurrency, formatDateTime } from '../../utils';
import { auth } from '../../lib/auth';

const EventDetail: React.FC = () => {
  const canManageEvents = auth.getUser()?.role === 'TENANT_ADMIN';
  const { id } = useParams<{ id: string }>();
  const event = useEvent(id ?? '');
  const tickets = useTickets();
  const orders = useOrders();
  const approveEvent = useApproveEvent();
  const rejectEvent = useRejectEvent();

  const [shareUrl, setShareUrl] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (event.data?.id) {
      setShareUrl(`${window.location.origin}/#/public/events/${event.data.id}`);
    }
  }, [event.data?.id]);

  const handleShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.data?.title || 'Event', url: shareUrl });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Only the ticket and order list endpoints exist, and neither is filterable
   * server-side, so the rows belonging to this event are narrowed here.
   */
  const eventTickets = React.useMemo(
    () => (tickets.data ?? []).filter((ticket) => String(ticket.eventId) === id),
    [tickets.data, id]
  );

  const eventOrders = React.useMemo(
    () => (orders.data ?? []).filter((order) => String(order.eventId) === id),
    [orders.data, id]
  );

  const pagedTickets = usePagedRows(eventTickets, 10);
  const pagedOrders = usePagedRows(eventOrders, 10);

  const soldCount = eventTickets.filter((t) => t.ticketStatus === 'SOLD').length;
  const lockedCount = eventTickets.filter((t) => t.ticketStatus === 'LOCKED').length;
  const revenue = eventOrders
    .filter((order) => order.orderStatus !== 'CANCELLED')
    .reduce((sum, order) => sum + (order.amount ?? 0), 0);

  if (event.isLoading) {
    return (
      <>
        <BackLink />
        <PageHeader title="Loading event..." />
        <Skeleton className="h-64 w-full" />
      </>
    );
  }

  if (event.error || !event.data) {
    return (
      <>
        <BackLink />
        <ErrorState
          title="Could not load event"
          description={event.error?.message ?? `Event ${id} was not found.`}
          onRetry={() => void event.refetch()}
        />
      </>
    );
  }

  const data = event.data;

  return (
    <>
      <BackLink />

      <PageHeader
        title={data.title}
        description={data.description ?? 'No description provided.'}
        actions={canManageEvents ? (
          <>
            <Button
              variant="secondary"
              leftIcon={<Share2 className="h-3.5 w-3.5" />}
              onClick={handleShare}
            >
              {copied ? 'Copied!' : 'Share event'}
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Check className="h-3.5 w-3.5" />}
              loading={approveEvent.isPending}
              onClick={() =>
                approveEvent.mutate(data.id, {
                  onSuccess: () => toast.success('Event approved'),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              leftIcon={<X className="h-3.5 w-3.5" />}
              loading={rejectEvent.isPending}
              onClick={() =>
                rejectEvent.mutate(data.id, {
                  onSuccess: () => toast.success('Event rejected'),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              Reject
            </Button>
          </>
        ) : undefined}
      />

      <div className="mb-4 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Status" value={data.status ?? 'UNSET'} />
        <StatCard label="Seats created" value={eventTickets.length} />
        <StatCard label="Sold" value={soldCount} tone="good" />
        <StatCard label="Locked" value={lockedCount} tone="warn" />
        <StatCard label="Booked value" value={formatCurrency(revenue)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="border-b border-[#3c3f41] px-4 py-3">
            <h2 className="text-[13px] font-semibold text-[#d7dae0]">Details</h2>
          </div>
          <dl className="divide-y divide-[#3c3f41]">
            <Detail label="Type" value={data.eventType ?? '-'} />
            <Detail label="Status" badge={data.status ?? 'UNSET'} />
            <Detail label="Date" value={formatDateTime(data.eventDate)} />
            <Detail
              label="Location"
              value={data.location ?? '-'}
              icon={data.location ? MapPin : undefined}
            />
            <Detail label="Base price" value={formatCurrency(data.basePrice)} />
            <Detail label="Capacity" value={data.capacity != null ? String(data.capacity) : '-'} />
            <Detail label="Created" value={formatDateTime(data.createdAt)} />
            <Detail label="Created by" value={data.createdBy ?? '-'} />
            <Detail label="Updated" value={formatDateTime(data.updatedAt)} />
            <Detail label="Updated by" value={data.updatedBy ?? '-'} />
          </dl>
          {data.imageUrl && (
            <img
              src={data.imageUrl}
              alt={data.title}
              className="max-h-40 w-full rounded-b-xl object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <section>
            <h2 className="mb-2 text-[13px] font-semibold text-[#d7dae0]">Inventory</h2>
            <QueryState
              isLoading={tickets.isLoading}
              error={tickets.error}
              isEmpty={eventTickets.length === 0}
              onRetry={() => void tickets.refetch()}
              emptyTitle="No seats for this event"
              emptyDescription="Add seats from the Inventory screen once the event exists."
              rows={4}
            >
              <Table>
                <thead>
                  <tr>
                    <Th>Seat</Th>
                    <Th>Tier</Th>
                    <Th>Price</Th>
                    <Th>Status</Th>
                    <Th>Locked until</Th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTickets.visible.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-[#3c3f41]">
                      <Td className="font-medium">{ticket.seatNumber}</Td>
                      <Td className="text-[#9da0a8]">{ticket.ticketType ?? '-'}</Td>
                      <Td>{formatCurrency(ticket.price)}</Td>
                      <Td>
                        <Badge status={ticket.ticketStatus ?? 'UNKNOWN'} />
                      </Td>
                      <Td className="whitespace-nowrap text-[#9da0a8]">
                        {ticket.lockedUntil ? formatDateTime(ticket.lockedUntil) : '-'}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pager
                page={pagedTickets.page}
                totalPages={pagedTickets.totalPages}
                total={pagedTickets.total}
                onChange={pagedTickets.setPage}
              />
            </QueryState>
          </section>

          <section>
            <h2 className="mb-2 text-[13px] font-semibold text-[#d7dae0]">Orders</h2>
            <QueryState
              isLoading={orders.isLoading}
              error={orders.error}
              isEmpty={eventOrders.length === 0}
              onRetry={() => void orders.refetch()}
              emptyTitle="No orders for this event"
              emptyDescription="Orders appear here once customers start buying."
              rows={3}
            >
              <Table>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Seat</Th>
                    <Th>Qty</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Placed</Th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.visible.map((order) => (
                    <tr key={order.id} className="border-t border-[#3c3f41]">
                      <Td className="font-medium">#{order.id}</Td>
                      <Td className="text-[#9da0a8]">#{order.ticketId}</Td>
                      <Td className="text-[#9da0a8]">{order.quantity}</Td>
                      <Td className="font-medium">{formatCurrency(order.amount)}</Td>
                      <Td>
                        <Badge status={order.orderStatus ?? 'UNKNOWN'} />
                      </Td>
                      <Td className="whitespace-nowrap text-[#9da0a8]">
                        {formatDateTime(order.orderDate)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pager
                page={pagedOrders.page}
                totalPages={pagedOrders.totalPages}
                total={pagedOrders.total}
                onChange={pagedOrders.setPage}
              />
            </QueryState>
          </section>
        </div>
      </div>
    </>
  );
};

const BackLink: React.FC = () => (
  <Link
    to="/admin/events"
    className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-[#9da0a8] hover:text-[#d7dae0]"
  >
    <ArrowLeft className="h-3.5 w-3.5" />
    All events
  </Link>
);

const Detail: React.FC<{
  label: string;
  value?: string;
  badge?: string;
  icon?: React.ElementType;
}> = ({ label, value, badge, icon: Icon }) => (
  <div className="flex items-start justify-between gap-3 px-4 py-2.5">
    <dt className="shrink-0 text-[12px] font-medium text-[#9da0a8]">{label}</dt>
    <dd className="flex min-w-0 items-center gap-1.5 text-right text-[13px] text-[#c4c7ce]">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-[#7d8188]" strokeWidth={1.8} />}
      {badge ? <Badge status={badge} /> : <span className="truncate">{value}</span>}
    </dd>
  </div>
);

export default EventDetail;
