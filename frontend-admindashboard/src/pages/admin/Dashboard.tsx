import React from 'react';
import { Link } from 'react-router-dom';
import { useTicketStats, useTickets } from '../../hooks/useApi';
import { Card, Skeleton, ErrorState, Badge } from '../../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRelativeTime, cn, getStatusColor, getPriorityColor } from '../../utils';
import { Ticket, Clock, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useTicketStats();
  const { data: recentTickets, isLoading: ticketsLoading } = useTickets({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });

  const statCards = [
    { label: 'Total tickets', value: stats?.totalTickets ?? 0, icon: Ticket, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Pending', value: stats?.pendingTickets ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Solved', value: stats?.solvedTickets ?? 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg response', value: `${stats?.averageResponseTime ?? 0}h`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  if (statsError) {
    return <ErrorState title="Failed to load dashboard" description="Unable to fetch dashboard statistics." onRetry={() => refetchStats()} />;
  }

  const tickets = recentTickets?.data || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-sm font-semibold text-orange-500">Overview</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Good to see you again</h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Here is what is happening with your support queue today.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{stat.label}</p>
                {statsLoading ? <Skeleton width={60} height={32} /> : <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>}
                <p className="text-[11px] sm:text-xs text-slate-400 mt-2">Updated just now</p>
              </div>
              <div className={cn('h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl flex items-center justify-center', stat.bg, stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div><h3 className="text-base font-bold text-slate-900">Ticket activity</h3><p className="text-xs text-slate-500 mt-1">Last 7 days</p></div>
          </div>
          {statsLoading ? <Skeleton width="100%" height={240} /> : stats?.recentTrend?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={stats.recentTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(15,23,42,.08)' }} />
                <Line type="monotone" dataKey="count" stroke="#F97316" strokeWidth={3} dot={{ r: 3, fill: '#F97316', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">No activity data available</div>}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5"><h3 className="text-base font-bold text-slate-900">Tickets by status</h3><p className="text-xs text-slate-500 mt-1">Current workload breakdown</p></div>
          {statsLoading ? <Skeleton width="100%" height={240} /> : stats?.ticketsByStatus ? (
            <div className="space-y-5">
              {Object.entries(stats.ticketsByStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2"><span className={cn('badge', getStatusColor(status))}>{status.replace('_', ' ')}</span><span className="text-sm font-bold text-slate-700">{count}</span></div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${stats.totalTickets > 0 ? (count / stats.totalTickets) * 100 : 0}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">No status data available</div>}
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4"><div><h3 className="text-base font-bold text-slate-900">Recent tickets</h3><p className="text-xs text-slate-500 mt-1">Latest customer activity</p></div><Link to="/admin/tickets" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700">View all <ArrowRight className="h-4 w-4" /></Link></div>
        {ticketsLoading ? <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4"><Skeleton width={40} height={40} className="rounded-xl" /><div className="flex-1 space-y-2"><Skeleton width="70%" height={16} /><Skeleton width="40%" height={14} /></div></div>)}</div> : tickets.length > 0 ? (
          <div className="divide-y divide-slate-100">{tickets.map((ticket) => <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"><div className="min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{ticket.title}</p><p className="text-xs text-slate-500 mt-1 truncate">{ticket.customerName} · {formatRelativeTime(ticket.createdAt)}</p></div><div className="flex items-center gap-2 shrink-0"><span className={cn('badge hidden sm:inline-flex', getPriorityColor(ticket.priority))}>{ticket.priority}</span><Badge status={ticket.status}>{ticket.status.replace('_', ' ')}</Badge></div></Link>)}</div>
        ) : <div className="text-center py-10 text-slate-400 text-sm">No recent tickets</div>}
      </Card>
    </div>
  );
};
