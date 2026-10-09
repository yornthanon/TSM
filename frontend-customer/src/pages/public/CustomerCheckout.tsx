import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Mail, Phone, Ticket as TicketIcon, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { QueryState } from 'frontend-shared/components/QueryState';
import { useCreateGuestOrder, usePublicEvent, usePublicTickets } from 'frontend-shared/hooks/useApi';
import { Button, Card, Input, SelectField } from 'frontend-shared/components/ui';
import { formatCurrency } from 'frontend-shared/utils';
import { PAYMENT_METHODS, type Order, type PaymentMethod, type Ticket } from 'frontend-shared/types/api';

const CUSTOMER_ORDER_KEY = 'customer_order_idempotency';

export default function CustomerCheckout() {
  const { id: shareToken = '' } = useParams();
  const eventQuery = usePublicEvent(shareToken);
  const ticketsQuery = usePublicTickets(shareToken);
  const createOrder = useCreateGuestOrder();

  const event = eventQuery.data;
  const tickets = ticketsQuery.data ?? [];
  const eventTickets = tickets;
  const availableTickets = eventTickets.filter((ticket) => ticket.ticketStatus === 'AVAILABLE');
  const byType = availableTickets.reduce<Record<string, Ticket[]>>((groups, ticket) => {
    const type = ticket.ticketType ?? 'STANDARD';
    (groups[type] ??= []).push(ticket);
    return groups;
  }, {});

  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [name, setName] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const selectedTicket = availableTickets.find((ticket) => String(ticket.id) === selectedTicketId);

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!selectedTicket || !event?.id) {
      toast.error('Please select a ticket');
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        shareToken,
        ticketId: selectedTicket.id,
        quantity: 1,
        customerName: name,
        paymentMethod,
        recipientEmail,
        phoneNumber,
        idempotencyKey: `${CUSTOMER_ORDER_KEY}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
      setCompletedOrder(order);
      toast.success('Order placed successfully! Check your email for confirmation.');
      setSelectedTicketId('');
      setRecipientEmail('');
      setPhoneNumber('');
      setName('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    }
  };

  return (
    <div>
      <Link to={`/public/events/${shareToken}`} className="mb-6 inline-flex items-center gap-2 text-xs text-[#9da0a8] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to event
      </Link>
      {completedOrder && (
        <section className="mb-6 rounded-2xl border border-[#3b806d] bg-[#14251f] p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG
                value={`TSM-TICKET:${completedOrder.id}:${completedOrder.qrToken ?? ''}`}
                size={180}
                level="H"
                includeMargin
                aria-label="Demo ticket QR code"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#68d8b6]">Purchase confirmed</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Your demo ticket is ready</h2>
              <p className="mt-2 text-sm leading-6 text-[#b4c9c0]">Order #{completedOrder.id} · Payment completed in demo mode.</p>
              <p className="mt-1 text-sm text-[#b4c9c0]">Show this QR code at check-in. A demo confirmation email was marked as sent.</p>
              <button type="button" onClick={() => window.print()} className="mt-4 rounded-lg bg-[#3574f0] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4c83f5]">Print / Save ticket</button>
            </div>
          </div>
        </section>
      )}
      <QueryState isLoading={eventQuery.isLoading} error={eventQuery.error as Error | null} isEmpty={!event} onRetry={() => void eventQuery.refetch()} emptyTitle="Event not found" emptyDescription="This event may have been removed or is not available.">
        {event && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
            <div>
              <section className="overflow-hidden rounded-2xl border border-[#2b3038] bg-[#181d25]">
                <div className="relative h-56 bg-gradient-to-br from-[#243657] to-[#18202d] sm:h-72">
                  {event.imageUrl ? <img src={event.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#6ea0ff]/50"><TicketIcon className="h-20 w-20" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11161e] via-transparent to-transparent" />
                </div>
                <div className="relative -mt-16 px-5 pb-6 sm:px-8">
                  <span className="inline-flex rounded-full border border-[#8fb3ff]/30 bg-[#182d4e] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#b8d0ff]">{event.status ?? 'Published'}</span>
                  <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white">{event.title}</h1>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#aeb6c3]">{event.description || 'No description provided.'}</p>
                </div>
              </section>
            </div>

            <div>
              <Card className="p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-white">Checkout</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#c4c7ce]">Select ticket</label>
                    <SelectField
                      value={selectedTicketId}
                      onChange={setSelectedTicketId}
                      ariaLabel="Select ticket"
                      className="w-full"
                      options={[
                        { value: '', label: 'Choose a ticket' },
                        ...Object.entries(byType).flatMap(([type, typeTickets]) =>
                          typeTickets.map((ticket) => ({
                            value: String(ticket.id),
                            label: `${type} - ${formatCurrency(ticket.price)} (Seat ${ticket.seatNumber})`,
                          }))
                        ),
                      ]}
                    />
                  </div>

                  <Input
                    label="Full name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={User}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    leftIcon={Mail}
                    required
                  />

                  <Input
                    label="Phone number"
                    placeholder="+855 12 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    leftIcon={Phone}
                    required
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#c4c7ce]">Payment method</label>
                    <SelectField
                      value={paymentMethod}
                      onChange={(value) => setPaymentMethod(value as PaymentMethod)}
                      ariaLabel="Payment method"
                      className="w-full"
                      options={PAYMENT_METHODS.map((method) => ({ value: method, label: method.replace('_', ' ').toLowerCase() }))}
                    />
                  </div>

                  {selectedTicket && (
                    <div className="rounded-lg border border-[#3c3f41] bg-[#1e1f22] p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#9da0a8]">Ticket price</span>
                        <span className="font-medium text-white">{formatCurrency(selectedTicket.price)}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-[#9da0a8]">Seat</span>
                        <span className="font-medium text-white">{selectedTicket.seatNumber}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                     leftIcon={<CreditCard className="h-4 w-4" />}
                    loading={createOrder.isPending}
                    disabled={!selectedTicket || !recipientEmail || !phoneNumber || !name}
                  >
                    Complete purchase
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
