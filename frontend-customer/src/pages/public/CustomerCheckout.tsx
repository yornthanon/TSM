import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Mail, Phone, Ticket as TicketIcon, User } from 'lucide-react';
import { toast } from 'sonner';
import { QueryState } from 'frontend-shared/components/QueryState';
import { useCreateOrder, useEvent, useTickets } from 'frontend-shared/hooks/useApi';
import { Button, Card, Input, SelectField } from 'frontend-shared/components/ui';
import { formatCurrency } from 'frontend-shared/utils';
import { PAYMENT_METHODS, type PaymentMethod, type Ticket } from 'frontend-shared/types/api';

const CUSTOMER_ORDER_KEY = 'customer_order_idempotency';

export default function CustomerCheckout() {
  const { id = '' } = useParams();
  const eventQuery = useEvent(id);
  const ticketsQuery = useTickets();
  const createOrder = useCreateOrder();

  const event = eventQuery.data;
  const tickets = ticketsQuery.data ?? [];
  const eventTickets = tickets.filter((ticket) => String(ticket.eventId) === String(id));
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

  const selectedTicket = availableTickets.find((ticket) => String(ticket.id) === selectedTicketId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTicket) {
      toast.error('Please select a ticket');
      return;
    }
    try {
      await createOrder.mutateAsync({
        eventId: Number(id),
        ticketId: selectedTicket.id,
        quantity: 1,
        amount: selectedTicket.price,
        paymentMethod,
        recipientEmail,
        phoneNumber,
        idempotencyKey: `${CUSTOMER_ORDER_KEY}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
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
      <Link to={`/public/events/${id}`} className="mb-6 inline-flex items-center gap-2 text-xs text-[#9da0a8] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to event
      </Link>
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
