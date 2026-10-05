import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { auth } from '../../lib/auth';
import { Badge, Button, Card, ConfirmDialog, ErrorState } from '../../components/ui';
import { PageHeader, QueryState, Table, Td, Th } from '../../components/QueryState';
import { formatDateTime } from '../../utils';

interface Workspace {
  id: number;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED';
  ownerUserId: number | null;
  createdAt: string | null;
}

const Workspaces: React.FC = () => {
  const queryClient = useQueryClient();
  const [target, setTarget] = React.useState<Workspace | null>(null);
  const isPlatformAdmin = auth.getUser()?.role === 'ADMIN';
  const workspaces = useQuery({
    queryKey: ['platform-workspaces'],
    queryFn: () => api.get<Workspace[]>('/admin/workspaces'),
    enabled: isPlatformAdmin,
  });
  const updateStatus = useMutation({
    mutationFn: ({ workspace, status }: { workspace: Workspace; status: Workspace['status'] }) =>
      api.patch<Workspace>(`/admin/workspaces/${workspace.id}/status`, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['platform-workspaces'] });
      toast.success('Workspace status updated.');
      setTarget(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!isPlatformAdmin) {
    return <ErrorState title="Platform administrator access required" description="Workspace administration is restricted to configured platform-admin Google accounts." />;
  }

  const desiredStatus: Workspace['status'] = target?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  return (
    <>
      <PageHeader
        title="Workspaces"
        description="Platform-wide tenant registry. Each workspace's ticketing data is isolated from other workspaces."
      />
      <Card className="mb-4 flex items-start gap-3 border-[#51402a] bg-[#211e19] p-4 shadow-none">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ffc66d]" />
        <p className="text-xs leading-5 text-[#b8a98e]">Suspending a workspace blocks its users and internal service requests immediately. It does not delete or alter workspace data.</p>
      </Card>
      <QueryState
        isLoading={workspaces.isLoading}
        error={workspaces.error}
        isEmpty={(workspaces.data ?? []).length === 0}
        onRetry={() => void workspaces.refetch()}
        emptyTitle="No workspaces found"
        emptyDescription="Verified Google users create their own workspace automatically when they sign in."
      >
        <Table>
          <thead>
            <tr><Th>Workspace</Th><Th>Owner user ID</Th><Th>Created</Th><Th>Status</Th><Th className="text-right">Action</Th></tr>
          </thead>
          <tbody>
            {(workspaces.data ?? []).map((workspace) => (
              <tr key={workspace.id} className="border-t border-[#30343b]">
                <Td>
                  <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-[#6fa6ff]" /><span className="font-medium text-[#dfe1e5]">{workspace.name}</span></div>
                  <span className="ml-6 font-jetbrains text-[10px] text-[#777f8b]">tenant #{workspace.id}</span>
                </Td>
                <Td className="font-jetbrains text-xs">{workspace.ownerUserId ?? '—'}</Td>
                <Td className="whitespace-nowrap text-[#9da0a8]">{workspace.createdAt ? formatDateTime(workspace.createdAt) : '—'}</Td>
                <Td><Badge status={workspace.status} /></Td>
                <Td>
                  <div className="flex justify-end">
                    <Button
                      variant={workspace.status === 'ACTIVE' ? 'danger' : 'secondary'}
                      size="sm"
                      disabled={workspace.id === 1 && workspace.status === 'ACTIVE'}
                      title={workspace.id === 1 ? 'The legacy workspace is protected from suspension in this console.' : undefined}
                      onClick={() => setTarget(workspace)}
                    >
                      {workspace.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </QueryState>
      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (target) updateStatus.mutate({ workspace: target, status: desiredStatus });
        }}
        title={desiredStatus === 'SUSPENDED' ? 'Suspend workspace' : 'Reactivate workspace'}
        description={desiredStatus === 'SUSPENDED'
          ? `${target?.name ?? 'This workspace'} will lose access immediately. Its data will remain stored and unchanged.`
          : `${target?.name ?? 'This workspace'} will be able to access its data again.`}
        confirmLabel={desiredStatus === 'SUSPENDED' ? 'Suspend workspace' : 'Reactivate workspace'}
        loading={updateStatus.isPending}
      />
    </>
  );
};

export default Workspaces;
