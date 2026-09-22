import React from 'react';
import { useTicketStats, useTickets } from '../../hooks/useApi';
import { Card, Skeleton, ErrorState, Badge } from '../../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRelativeTime, cn, getStatusColor, getPriorityColor } from '../../utils';
import { Ticket, Clock, CheckCircle, TrendingUp, ArrowUpRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useTicketStats();
  const { data: recentTickets } = useTickets({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });

  const statCards = [
    { label: 'Total Tickets', value: stats?.totalTickets ?? 0, icon: Ticket, color: 'text-[#F6821F]' },
    { label: 'Pending', value: stats?.pendingTickets ?? 0, icon: Clock, color: 'text-yellow-600' },
    { label: 'Solved', value: stats?.solvedTickets ?? 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Avg Response', value: `${stats?.averageResponseTime ?? 0}h`, icon: TrendingUp, color: 'text-blue-600' },
  ];

  if (statsError) {
    return <ErrorState title="Failed to load dashboard" description="Unable to fetch dashboard statistics." onRetry={() => refetchStats()} />;
  }

  const tickets = recentTickets?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your tickets.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {statsLoading ? (
                  <Skeleton width={60} height={32} />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">+12%</span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className={cn('h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center', stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Trend</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          {statsLoading ? (
            <Skeleton width="100%" height={300} />
          ) : stats?.recentTrend && stats.recentTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.recentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EE" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E6E8EE', borderRadius: '8px' }}
                  labelStyle={{ color: '#1F2937' }}
                />
                <Line type="monotone" dataKey="count" stroke="#F6821F" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tickets by Status</h3>
          </div>
          {statsLoading ? (
            <Skeleton width="100%" height={300} />
          ) : stats?.ticketsByStatus ? (
            <div className="space-y-4">
              {Object.entries(stats.ticketsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn('badge', getStatusColor(status))}>{status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[#F6821F] h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalTickets > 0 ? (count / stats.totalTickets) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
        </div>
        {statsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton width={40} height={40} className="rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="70%" height={16} />
                  <Skeleton width="40%" height={14} />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{ticket.customerName} • {formatRelativeTime(ticket.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('badge', getPriorityColor(ticket.priority))}>{ticket.priority}</span>
                  <Badge status={ticket.status}>{ticket.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">No recent tickets</div>
        )}
      </Card>
    </div>
  );
};
