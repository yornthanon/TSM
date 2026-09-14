import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, Clock3, MapPin, Minus, Plus, Search, Ticket, Users, X } from 'lucide-react'
import { api, type EventItem, type Order, type Ticket as TicketType } from './api'

type Step = 'home' | 'detail' | 'booking' | 'success'
type Selection = Record<number, number>

const fallbackEvents: EventItem[] = []
const money = (value = 0) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
const label = (event: EventItem) => event.name || event.title || 'Untitled event'
const dateLabel = (event: EventItem) => event.eventDate || event.date || 'Date to be announced'

export default function App() {
  const [step, setStep] = useState<Step>('home')
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [selection, setSelection] = useState<Selection>({})
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })

  useEffect(() => { api.events().then(setEvents).catch((e) => setError(e.message)).finally(() => setLoading(false)); api.tickets().then(setTickets).catch(() => {}) }, [])
  const filtered = events.filter((event) => label(event).toLowerCase().includes(query.toLowerCase()))
  const eventTickets = selectedEvent ? tickets.filter((ticket) => !ticket.eventId || ticket.eventId === selectedEvent.id) : []
  const total = eventTickets.reduce((sum, ticket) => sum + (selection[ticket.id] || 0) * (ticket.price || 0), 0)
  const count = Object.values(selection).reduce((sum, quantity) => sum + quantity, 0)

  function openEvent(event: EventItem) { setSelectedEvent(event); setSelection({}); setStep('detail') }
  function goBack() { setStep(step === 'booking' ? 'detail' : 'home') }
  async function submitOrder() {
    if (!selectedEvent || !customer.name || !customer.email || count === 0) return
    setLoading(true); setError('')
    try {
      const body = { eventId: selectedEvent.id, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone, tickets: Object.entries(selection).filter(([, quantity]) => quantity > 0).map(([ticketId, quantity]) => ({ ticketId: Number(ticketId), quantity })) }
      setOrder(await api.createOrder(body)); setStep('success')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  return <div className="app-shell"><header className="site-header"><a className="brand" href="#" onClick={(e) => { e.preventDefault(); setStep('home') }}><span className="brand-mark"><Ticket /></span><span>TSM<span className="brand-dot">.</span></span></a><nav><a href="#events" onClick={() => setStep('home')}>Events</a><a href="#about">About us</a><a href="#help">Help</a></nav><button className="header-button" onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}>Find an event <ArrowRight /></button></header>
    {step === 'home' && <main><section className="hero"><div className="hero-copy"><p className="eyebrow">THE EASIEST WAY TO GO OUT</p><h1>Make plans.<br /><em>Make memories.</em></h1><p className="hero-text">Discover the moments worth showing up for. Find your next event and book your spot in just a few clicks.</p><button className="primary-button" onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}>Explore events <ArrowRight /></button></div><div className="hero-art"><div className="hero-card hero-card-back"></div><div className="hero-card hero-card-main"><div className="ticket-label">LIVE / 2025</div><div className="hero-date">24<br /><small>JUNE</small></div><div className="hero-card-bottom"><span>Rooftop<br />Sessions</span><span className="circle-arrow">↗</span></div></div><div className="hero-sticker">YOUR<br />NEXT<br /><span>MEMORY</span></div></div></section><section id="events" className="events-section"><div className="section-heading"><div><p className="eyebrow">WHAT'S HAPPENING</p><h2>Find your <em>moment.</em></h2></div><div className="search-box"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" /></div></div>{error && <div className="notice"><X />{error}<button onClick={() => location.reload()}>Try again</button></div>}{loading ? <div className="loading">Loading events...</div> : filtered.length === 0 ? <div className="empty"><CalendarDays /><h3>No events found</h3><p>Check back soon for something new.</p></div> : <div className="event-grid">{filtered.map((event, index) => <article className="event-card" key={event.id} onClick={() => openEvent(event)}><div className={`event-image image-${index % 3}`}><span className="event-tag">UPCOMING</span><span className="event-number">0{index + 1}</span></div><div className="event-info"><div><h3>{label(event)}</h3><p><CalendarDays />{dateLabel(event)}</p><p><MapPin />{event.location || 'Location to be announced'}</p></div><button aria-label={`Book ${label(event)}`}><ArrowUpRight /></button></div></article>)}</div>}</section></main>}
    {step !== 'home' && <main className="flow-main"><button className="back-link" onClick={goBack}><ArrowLeft /> Back</button>{step === 'detail' && selectedEvent && <section className="detail-layout"><div className="detail-visual image-1"><span className="event-tag">UPCOMING EVENT</span></div><div className="detail-content"><p className="eyebrow">EVENT DETAILS</p><h1>{label(selectedEvent)}</h1><p className="detail-description">{selectedEvent.description || 'A special experience awaits. Join us for an unforgettable event filled with energy, connection and great memories.'}</p><div className="detail-meta"><span><CalendarDays /><b>{dateLabel(selectedEvent)}</b></span><span><MapPin /><b>{selectedEvent.location || 'Location to be announced'}</b></span><span><Clock3 /><b>Doors open at 6:00 PM</b></span></div><div className="ticket-panel"><div className="panel-title"><h2>Choose your tickets</h2><span>{count} selected</span></div>{eventTickets.length === 0 ? <p className="muted">Ticket types will be available soon.</p> : eventTickets.map((ticket) => { const quantity = selection[ticket.id] || 0; const available = ticket.availableQuantity ?? ticket.quantity ?? 10; return <div className="ticket-row" key={ticket.id}><div><strong>{ticket.name || ticket.type || 'General admission'}</strong><small>{available} tickets available</small></div><b>{money(ticket.price)}</b><div className="stepper"><button onClick={() => setSelection({ ...selection, [ticket.id]: Math.max(0, quantity - 1) })}><Minus /></button><span>{quantity}</span><button disabled={quantity >= available} onClick={() => setSelection({ ...selection, [ticket.id]: quantity + 1 })}><Plus /></button></div></div>})}<div className="total-row"><span>Total</span><strong>{money(total)}</strong></div><button className="primary-button full" disabled={!count} onClick={() => setStep('booking')}>Continue to booking <ArrowRight /></button></div></div></section>}
      {step === 'booking' && <section className="booking-layout"><div className="booking-copy"><p className="eyebrow">ALMOST THERE</p><h1>Your details,<br /><em>your tickets.</em></h1><p>We&apos;ll send your booking confirmation to the email address you provide.</p><div className="summary-mini"><span><Ticket /> {count} tickets</span><strong>{money(total)}</strong></div></div><form className="booking-form" onSubmit={(e) => { e.preventDefault(); submitOrder() }}><div className="form-header"><span className="step-index">01</span><div><h2>Who&apos;s booking?</h2><p>Enter your contact details</p></div></div><label>Full name<input required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Your full name" /></label><label>Email address<input required type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="you@example.com" /></label><label>Phone number <span>(optional)</span><input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+855 12 345 678" /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button full" disabled={loading}>{loading ? 'Submitting...' : 'Confirm booking'} <ArrowRight /></button><p className="terms">By continuing, you agree to our booking terms.</p></form></section>}
      {step === 'success' && <section className="success-card"><div className="success-icon"><Check /></div><p className="eyebrow">BOOKING CONFIRMED</p><h1>You&apos;re on the list.</h1><p>Your tickets are reserved. We&apos;ve sent the confirmation to <b>{customer.email}</b>.</p><div className="confirmation"><span>Booking reference</span><strong>{order?.orderNumber || order?.reference || `TSM-${order?.id || 'CONFIRMED'}`}</strong><div className="confirmation-line"></div><span>Event</span><b>{selectedEvent ? label(selectedEvent) : 'Your event'}</b><span>Total paid</span><b>{money(order?.totalAmount || total)}</b></div><button className="primary-button" onClick={() => setStep('home')}>Discover more events <ArrowRight /></button></section>}
    </main>}<footer><span>TSM <i>Ticketing made simple.</i></span><span>© 2025 TSM Events</span></footer></div>
}
function ArrowUpRight() { return <ArrowRight className="arrow-up" /> }
