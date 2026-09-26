import React from 'react';
import { Link } from 'react-router-dom';
import { useTicketStats, useTickets } from '../../hooks/useApi';
import { Card, Skeleton, ErrorState, Badge } from '../../components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, CheckCircle2, Clock3, MoreHorizontal, Sparkles, Ticket, Timer, Zap } from 'lucide-react';
import { cn, formatRelativeTime, getPriorityColor } from '../../utils';

const statusColors: Record<string, string> = {
  open: 'bg-[#7c5cff]', in_progress: 'bg-[#7c5cff]', review: 'bg-[#8f7be8]', pending: 'bg-[#f0b54b]', resolved: 'bg-[#5bc487]', closed: 'bg-[#9c9ca5]', available: 'bg-[#5bc487]', locked: 'bg-[#f0b54b]', sold: 'bg-[#7c5cff]',
};

const avatarColors = ['bg-[#dce7ff] text-[#4a65a8]', 'bg-[#ffe3d8] text-[#b65b39]', 'bg-[#dcf3e8] text-[#3d8964]', 'bg-[#f1e0ff] text-[#8856aa]'];

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useTicketStats();
  const { data: recentTickets, isLoading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useTickets({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });

  if (statsError) return <ErrorState title="Failed to load dashboard" description="The dashboard could not load live ticket statistics." onRetry={() => refetchStats()} />;
  if (ticketsError) return <ErrorState title="Failed to load recent tickets" description="The dashboard could not load live ticket activity." onRetry={() => refetchTickets()} />;

  const tickets = recentTickets?.data || [];
  const statusBreakdown = stats?.byStatus || stats?.ticketsByStatus || {};
  const statusCount = (names: string[]) => names.reduce((sum, name) => sum + Number(statusBreakdown[name] || statusBreakdown[name.toUpperCase()] || 0), 0);
  const total = stats?.total ?? stats?.totalTickets ?? Object.values(statusBreakdown).reduce((sum, count) => sum + Number(count), 0);
  const pending = stats?.pendingTickets ?? statusCount(['pending', 'locked']);
  const solved = stats?.solvedTickets ?? statusCount(['resolved', 'closed', 'sold']);
  const responseTime = stats?.averageResponseTime;
  const trend = stats?.recentTrend || [];

  const statCards = [
    { label: 'Total tickets', value: total, icon: Ticket, tone: 'purple', detail: 'Live from ticket service' },
    { label: 'Pending tickets', value: pending, icon: Clock3, tone: 'amber', detail: 'Needs attention' },
    { label: 'Solved tickets', value: solved, icon: CheckCircle2, tone: 'green', detail: 'Resolved in the system' },
    { label: 'Avg. response time', value: responseTime === undefined ? '—' : `${responseTime}h`, icon: Timer, tone: 'blue', detail: responseTime === undefined ? 'Not provided by ticket service' : 'Measured by ticket service' },
  ];

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#7c5cff]"><Sparkles className="h-3.5 w-3.5" /> Live workspace</p><h2 className="text-[27px] font-semibold tracking-[-0.04em] text-[#292933]">Support overview</h2><p className="mt-1.5 text-sm text-[#898994]">Monitor your real ticket workload and recent activity.</p></div>
        <div className="flex items-center gap-2"><span className="rounded-lg border border-[#dcefe3] bg-[#f1fbf5] px-3 py-2 text-xs font-medium text-[#36935d]"><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#4dbb7c]" />Live data</span><button aria-label="More dashboard options" className="rounded-lg border border-[#e5e5e9] bg-white p-2 text-[#9797a1] shadow-sm hover:text-[#62626d]"><MoreHorizontal className="h-4 w-4" /></button></div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => { const Icon = stat.icon; const tone = { purple: 'bg-[#eeeaff] text-[#7156e8]', amber: 'bg-[#fff2d9] text-[#c78820]', green: 'bg-[#e4f6ec] text-[#47a56e]', blue: 'bg-[#e3f0ff] text-[#5089c5]' }[stat.tone]; return <Card key={stat.label} className="border-[#ebebef] bg-white p-5 shadow-[0_3px_12px_rgba(30,30,45,.025)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(30,30,45,.06)]"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-[#90909a]">{stat.label}</p>{statsLoading ? <Skeleton width={72} height={32} /> : <p className="mt-2 text-[29px] font-semibold tracking-[-0.04em] text-[#292933]">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>}</div><div className={cn('flex h-9 w-9 items-center justify-center rounded-[10px]', tone)}><Icon className="h-[17px] w-[17px]" strokeWidth={2} /></div></div><p className="mt-4 text-[11px] text-[#a4a4ad]">{stat.detail}</p></Card> })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card className="border-[#ebebef] bg-white p-5 shadow-[0_3px_12px_rgba(30,30,45,.025)] sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h3 className="text-[14px] font-semibold text-[#3a3a45]">Ticket volume</h3><p className="mt-1 text-xs text-[#9a9aa4]">Live ticket activity over time</p></div><div className="flex items-center gap-1.5 text-[11px] text-[#8e8e99]"><span className="h-2 w-2 rounded-full bg-[#7c5cff]" /> Tickets</div></div><div className="h-[245px]">{statsLoading ? <Skeleton width="100%" height={245} /> : trend.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 8, right: 6, left: -26, bottom: 0 }}><defs><linearGradient id="ticketFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c5cff" stopOpacity={0.2} /><stop offset="100%" stopColor="#7c5cff" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#f0f0f3" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" stroke="#aaaab3" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#aaaab3" fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#292933', border: '0', borderRadius: '9px', color: '#fff', fontSize: 11 }} /><Area type="monotone" dataKey="count" stroke="#7c5cff" strokeWidth={2.5} fill="url(#ticketFill)" dot={{ r: 3, fill: '#fff', stroke: '#7c5cff', strokeWidth: 2 }} activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-xs text-[#9a9aa4]">No trend data available.</div>}</div></Card>

        <Card className="border-[#ebebef] bg-white p-5 shadow-[0_3px_12px_rgba(30,30,45,.025)] sm:p-6"><div className="mb-6 flex items-start justify-between"><div><h3 className="text-[14px] font-semibold text-[#3a3a45]">Status overview</h3><p className="mt-1 text-xs text-[#9a9aa4]">Current ticket distribution</p></div><Link to="/admin/tickets" className="text-xs font-semibold text-[#7657e8] hover:text-[#5e42cc]">View tickets</Link></div><div className="space-y-5">{Object.entries(statusBreakdown).length ? Object.entries(statusBreakdown).map(([status, count]) => { const percentage = total ? Math.round((Number(count) / total) * 100) : 0; return <div key={status}><div className="mb-2 flex items-center justify-between"><span className="text-xs font-medium capitalize text-[#666671]">{status.replace('_', ' ').toLowerCase()}</span><span className="text-xs font-semibold text-[#3d3d48]">{count} <span className="ml-1 font-normal text-[#a6a6ae]">({percentage}%)</span></span></div><div className="h-2 overflow-hidden rounded-full bg-[#f0f0f3]"><div className={cn('h-full rounded-full transition-all', statusColors[status.toLowerCase()] || 'bg-[#9c9ca5]')} style={{ width: `${Math.min(100, percentage)}%` }} /></div></div> }) : <div className="py-8 text-center text-xs text-[#9a9aa4]">No status data available.</div>}</div><div className="mt-7 flex items-center gap-2 rounded-[10px] bg-[#faf9ff] px-3.5 py-3 text-xs text-[#756a9b]"><Zap className="h-4 w-4 text-[#7c5cff]" /> This panel updates from the ticket service.</div></Card>
      </section>

      <Card className="border-[#ebebef] bg-white shadow-[0_3px_12px_rgba(30,30,45,.025)]"><div className="flex items-center justify-between border-b border-[#f0f0f2] px-5 py-4 sm:px-6"><div><h3 className="text-[14px] font-semibold text-[#3a3a45]">Recent tickets</h3><p className="mt-1 text-xs text-[#9a9aa4]">Latest live activity from your ticket service</p></div><Link to="/admin/tickets" className="flex items-center gap-1 text-xs font-semibold text-[#7657e8] hover:text-[#5e42cc]">See all <ArrowUpRight className="h-3.5 w-3.5" /></Link></div><div className="divide-y divide-[#f3f3f5]">{ticketsLoading ? [...Array(4)].map((_, i) => <div key={i} className="flex items-center gap-3 px-5 py-4"><Skeleton width={34} height={34} className="rounded-full" /><div className="flex-1 space-y-2"><Skeleton width="45%" height={13} /><Skeleton width="25%" height={10} /></div></div>) : tickets.length ? tickets.map((ticket, index) => <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`} className="group flex items-center gap-3 px-5 py-4 transition hover:bg-[#fbfbfc] sm:px-6"><div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', avatarColors[index % avatarColors.length])}>{ticket.customerName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#44444f] group-hover:text-[#6c50df]">{ticket.title}</p><p className="mt-1 truncate text-[11px] text-[#9c9ca5]">{ticket.customerName} <span className="mx-1 text-[#d4d4d8]">·</span> {formatRelativeTime(ticket.createdAt)}</p></div><div className="hidden items-center gap-3 sm:flex"><span className={cn('badge text-[10px]', getPriorityColor(ticket.priority))}>{ticket.priority}</span><Badge status={ticket.status}>{ticket.status.replace('_', ' ')}</Badge><ArrowUpRight className="h-3.5 w-3.5 text-[#c1c1c9] opacity-0 transition group-hover:opacity-100" /></div></Link>) : <div className="px-5 py-10 text-center text-xs text-[#9a9aa4]">No tickets found.</div>}</div></Card>
    </div>
  );
};
