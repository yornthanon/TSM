import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, MessageSquare, History, Activity } from 'lucide-react';
import { useTicket, useComments, useActivity as useTicketActivity, useUpdateTicket, useAddComment } from '../../hooks/useApi';
import { Card, Skeleton, Button, Input } from '../../components/ui';
import { formatDateTime, formatRelativeTime, cn, getPriorityColor, formatDate } from '../../utils';
import type { Comment, ActivityLog, TicketStatus } from '../../types/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

type CommentFormData = z.infer<typeof commentSchema>;

const statuses: TicketStatus[] = ['open', 'in_progress', 'review', 'resolved', 'closed'];

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'description' | 'comments' | 'history' | 'attachments'>('description');
  const [statusUpdate, setStatusUpdate] = useState<TicketStatus | ''>('');

  const { data: ticket, isLoading: ticketLoading, error: ticketError, refetch } = useTicket(id || '');
  const { data: comments, isLoading: commentsLoading } = useComments(id || '');
  const { data: activity, isLoading: activityLoading } = useTicketActivity(id || '');

  const updateTicket = useUpdateTicket({
    onSuccess: () => {
      toast.success('Ticket updated');
      refetch();
    },
    onError: () => toast.error('Failed to update ticket'),
  });

  const addComment = useAddComment({
    onSuccess: () => {
      toast.success('Comment added');
      reset({ content: '' });
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onCommentSubmit = (data: CommentFormData) => {
    if (!id) return;
    addComment.mutate({ ticketId: id, data: { content: data.content } });
  };

  const handleStatusChange = () => {
    if (!id || !statusUpdate) return;
    updateTicket.mutate({ id, data: { status: statusUpdate } });
  };

  if (ticketError) return <div className="text-center py-12 text-red-600">Failed to load ticket.</div>;
  if (!ticket && !ticketLoading) return <div className="text-center py-12 text-gray-500">Ticket not found.</div>;

  const tabs = [
    { id: 'description', label: 'Description', icon: MessageSquare },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'attachments', label: 'Attachments', icon: Paperclip },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/tickets')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          {ticketLoading ? (
            <Skeleton width={300} height={28} />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">{ticket?.title}</h1>
              <p className="text-gray-500 text-sm mt-1">Ticket #{ticket?.ticketId} • {ticket?.customerName}</p>
            </>
          )}
        </div>
      </div>

      {ticket && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 border-b border-gray-100 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2',
                      activeTab === tab.id
                        ? 'border-[#F6821F] text-[#F6821F]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'description' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                  {ticket.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {ticket.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} width="100%" height={60} />
                      ))}
                    </div>
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment: Comment) => (
                        <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-[#F6821F]/10 flex items-center justify-center text-[#F6821F] font-medium text-xs">
                            {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                              <p className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</p>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">No comments yet.</div>
                  )}
                  <form onSubmit={handleSubmit(onCommentSubmit)} className="flex gap-3 pt-4 border-t border-gray-100">
                    <Input
                      placeholder="Write a comment..."
                      {...register('content')}
                      error={errors.content?.message}
                      className="flex-1"
                    />
                    <Button type="submit" loading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>Send</Button>
                  </form>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {activityLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} width="100%" height={40} />
                      ))}
                    </div>
                  ) : activity && activity.length > 0 ? (
                    <div className="space-y-4">
                      {activity.map((item: ActivityLog) => (
                        <div key={item.id} className="flex gap-3 items-start">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{item.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.userName} • {formatRelativeTime(item.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">No activity yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'attachments' && (
                <div>
                  {ticket.attachments.length > 0 ? (
                    <div className="space-y-3">
                      {ticket.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.type}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Download</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">No attachments.</div>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ticket Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <div className="mt-1">
                    <select
                      value={ticket.status}
                      onChange={(e) => setStatusUpdate(e.target.value as TicketStatus)}
                      className="input"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  {statusUpdate && statusUpdate !== ticket.status && (
                    <Button size="sm" className="mt-2" onClick={handleStatusChange}>Update Status</Button>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Priority</p>
                  <span className={cn('badge mt-1', getPriorityColor(ticket.priority))}>{ticket.priority}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Assignee</p>
                  <p className="text-sm text-gray-900 mt-1">{ticket.assigneeName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Due Date</p>
                  <p className="text-sm text-gray-900 mt-1">{ticket.dueDate ? formatDate(ticket.dueDate) : 'No due date'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                  <p className="text-sm text-gray-900 mt-1">{formatDateTime(ticket.createdAt)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
