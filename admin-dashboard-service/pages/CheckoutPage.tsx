import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CreditCard, Loader2, CheckCircle2, Mail, Phone, User } from 'lucide-react';
import { useBooking } from '../lib/booking';
import { useLanguage } from '../i18n';
import { useAuth } from '../lib/auth';
import { api } from '../services/apiClient';
import { Button, Card, CardContent, CardHeader, Field, Input, Select, Badge } from '../components/ui';
import { formatMoney } from '../lib/format';
import { PaymentMethod } from '../types';

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(8, 'Valid phone required'),
  paymentMethod: z.string(),
});

type FormValues = z.infer<typeof schema>;

const steps = (isKhmer: boolean) =>
  isKhmer
    ? ['ផ្ទៀងផ្ទាត់ការកក់', 'ការទូទាត់មានសុវត្ថិភាព', 'ផ្ញើសំបុត្រអេឡិចត្រូនិក']
    : ['Verify booking', 'Secure payment', 'Email e-ticket'];

export const CheckoutPage: React.FC = () => {
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();
  const { pending, setPending, setLastOrder } = useBooking();
  const { identity } = useAuth();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: identity?.username ?? '',
      email: identity ? `${identity.username}@example.com` : '',
      phone: '+855',
      paymentMethod: 'BANK_TRANSFER',
    },
  });

  const total = useMemo(() => pending?.seats.reduce((sum, s) => sum + s.price, 0) ?? 0, [pending]);

  if (!pending) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="text-4xl mb-3">🛒</div>
        <h1 className="font-display text-xl font-bold text-ink">{isKhmer ? 'គ្មានការកក់សំបុត្រ' : 'No active booking'}</h1>
        <p className="text-sm text-ink-soft mt-2">{isKhmer ? 'សូមជ្រើសរើសកៅអីលើកម្មវិធីជាមុនសិន។' : 'Please select seats on an event first.'}</p>
        <Button className="mt-6" onClick={() => navigate('/events')}>{isKhmer ? 'ទៅមើលកម្មវិធី' : 'Browse events'}</Button>
      </div>
    );
  }

  const { event, seats } = pending;

  const placeOrder = handleSubmit(async (values) => {
    setPlacing(true);
    setError(null);
    try {
      const res = await api.request<{ order: any; payment?: any; notifications?: any[] }>('POST', '/api/v1/orders/create', {
        eventId: event.id,
        ticketId: seats[0].id,
        quantity: seats.length,
        amount: total,
        paymentMethod: values.paymentMethod,
        recipientEmail: values.email,
        phoneNumber: values.phone,
      });
      if (res.error) throw new Error(res.description || 'Order failed');
      setStep(2);
      await new Promise((r) => setTimeout(r, 500));
      setLastOrder({ order: res.data!.order, payment: res.data!.payment, notifiedAt: res.data!.notifications?.[0]?.sentAt });
      setPending(null);
      navigate(`/orders/${res.data!.order.id}`);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setPlacing(false);
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(`/events/${event.id}`)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition mb-6">
        <ArrowLeft className="w-4 h-4" /> {isKhmer ? 'ត្រលប់ទៅកម្មវិធី' : 'Back to event'}
      </button>

      <h1 className="font-display text-3xl font-bold text-ink mb-2">{isKhmer ? 'ការទូទាត់' : 'Checkout'}</h1>
      <p className="text-sm text-ink-soft mb-8">{isKhmer ? 'បញ្ចប់ការកក់សំបុត្ររបស់អ្នក' : 'Complete your ticket booking'}</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps(isKhmer).map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className={`h-0.5 flex-1 ${step >= i ? 'bg-brand-500' : 'bg-line'}`} />}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= i ? 'bg-brand-600 text-white' : 'bg-line text-ink-soft'}`}>
                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${step >= i ? 'text-ink' : 'text-ink-soft'}`}>{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader title={isKhmer ? 'ព័ត៌មានទំនាក់ទំនង' : 'Contact & payment'} subtitle={isKhmer ? 'សំបុត្រអេឡិចត្រូនិកនឹងត្រូវផ្ញើទៅកាន់អ៊ីមែលខាងក្រោម' : 'Your e-ticket will be delivered to this email'} />
            <CardContent>
              <form onSubmit={placeOrder} className="space-y-4">
                <Field label={isKhmer ? 'ឈ្មោះពេញ' : 'Full name'} hint={errors.fullName?.message}>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <Input className="pl-10" placeholder="Sopheap Chan" {...register('fullName')} />
                  </div>
                </Field>
                <Field label={isKhmer ? 'អ៊ីមែល' : 'Email'} hint={errors.email?.message}>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <Input className="pl-10" placeholder="you@example.com" {...register('email')} />
                  </div>
                </Field>
                <Field label={isKhmer ? 'ទូរស័ព្ទ' : 'Phone number'} hint={errors.phone?.message}>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <Input className="pl-10" placeholder="+855..." {...register('phone')} />
                  </div>
                </Field>
                <Field label={isKhmer ? 'វិធីទូទាត់' : 'Payment method'}>
                  <Select {...register('paymentMethod')}>
                    <option value="BANK_TRANSFER">ABA / Bank Transfer</option>
                    <option value="CREDIT_CARD">Credit Card (Visa/Mastercard)</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="PAYPAL">PayPal</option>
                  </Select>
                </Field>

                {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}

                <Button type="submit" size="lg" loading={placing} className="w-full">
                  {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> {isKhmer ? 'កំពុងដំណើរការ...' : 'Processing...'}</> : (
                    isKhmer ? `បញ្ជាក់ការទិញ ($${total.toFixed(2)})` : `Complete purchase (${formatMoney(total)})`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title={isKhmer ? 'សង្ខេបការកក់' : 'Booking summary'} action={<Badge tone="brand">{seats.length} ×</Badge>} />
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-brand-50/60 border border-brand-100 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">{isKhmer ? 'កម្មវិធី' : 'Event'}</div>
                <div className="font-semibold text-ink text-sm mt-1">{event.title}</div>
                <div className="text-xs text-ink-soft mt-1">{event.location}</div>
              </div>

              <div className="space-y-2">
                {seats.map((seat) => (
                  <div key={seat.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-white border border-line flex items-center justify-center text-[11px] font-bold text-ink">
                        {seat.code}
                      </span>
                      <span className="text-ink-soft text-xs">{seat.tier} tier</span>
                    </div>
                    <span className="font-semibold text-ink">${seat.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-line pt-4 space-y-2">
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>{isKhmer ? 'សរុបរង' : 'Subtotal'}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>{isKhmer ? 'ថ្លៃសេវា' : 'Service fee'}</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-display text-lg font-bold text-ink pt-1">
                  <span>{isKhmer ? 'សរុប' : 'Total'}</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-ink-soft pt-1">
                <CreditCard className="w-4 h-4 text-brand-500" />
                {isKhmer ? 'ការទូទាត់តាមរយៈ Payment Service, ABA/Card gateway' : 'Secured by Payment Service · ABA/Card gateway'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;