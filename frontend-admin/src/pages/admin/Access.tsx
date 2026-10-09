import React from 'react';
import { Building2, KeyRound, Plus, ShieldCheck, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminWorkspaces,
  useCreateGroup,
  useCreateRole,
  useGrantWorkspaceAccess,
  useGroups,
  usePermissions,
  useRevokeWorkspaceAccess,
  useRoles,
  useUserAccessGrants,
  useUsers,
} from 'frontend-shared/hooks/useApi';
import { PageHeader, QueryState, StatCard } from 'frontend-shared/components/QueryState';
import { Badge, Button, Card, Input, Modal } from 'frontend-shared/components/ui';
import { formatDate } from 'frontend-shared/utils';
import { MfaSettings } from './MfaSettings';

const Access: React.FC = () => {
  const roles = useRoles();
  const permissions = usePermissions();
  const groups = useGroups();
  const createRole = useCreateRole();
  const createGroup = useCreateGroup();

  const [roleModal, setRoleModal] = React.useState(false);
  const [groupModal, setGroupModal] = React.useState(false);

  const loading = roles.isLoading || permissions.isLoading || groups.isLoading;
  const error = roles.error ?? permissions.error ?? groups.error;

  return (
    <>
      <PageHeader
        title="Access control"
        description="Roles, groups and permissions as registered by the auth service."
        actions={
          <>
            <Button variant="secondary" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setGroupModal(true)}>
              New group
            </Button>
            <Button leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setRoleModal(true)}>
              New role
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Roles" value={roles.data?.length ?? 0} />
        <StatCard label="Groups" value={groups.data?.length ?? 0} />
        <StatCard label="Permissions" value={permissions.data?.length ?? 0} />
      </div>
      <WorkspaceAccessPanel />

      <QueryState
        isLoading={loading}
        error={error}
        isEmpty={
          (roles.data?.length ?? 0) + (groups.data?.length ?? 0) + (permissions.data?.length ?? 0) === 0
        }
        onRetry={() => {
          void roles.refetch();
          void groups.refetch();
          void permissions.refetch();
        }}
        emptyTitle="No access-control records"
        emptyDescription="Roles and groups are created by the auth service on first run."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ListCard title="Roles" isEmpty={(roles.data?.length ?? 0) === 0}>
            {(roles.data ?? []).map((role) => (
              <li key={role.id} className="flex items-start justify-between gap-3 border-t border-[#3c3f41] py-2.5 first:border-t-0">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#d7dae0]">{role.name}</p>
                  {role.description && (
                    <p className="mt-0.5 text-[12px] text-[#9da0a8]">{role.description}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-[#7d8188]">
                    Created {formatDate(role.created_at)} by {role.created_by ?? 'system'}
                  </p>
                </div>
                <Badge status={role.status ?? 'UNKNOWN'} />
              </li>
            ))}
          </ListCard>

          <ListCard title="Groups" isEmpty={(groups.data?.length ?? 0) === 0}>
            {(groups.data ?? []).map((group) => (
              <li key={group.id} className="flex items-start justify-between gap-3 border-t border-[#3c3f41] py-2.5 first:border-t-0">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#d7dae0]">{group.name}</p>
                  {group.description && (
                    <p className="mt-0.5 text-[12px] text-[#9da0a8]">{group.description}</p>
                  )}
                </div>
                <Badge status={group.status ?? 'UNKNOWN'} />
              </li>
            ))}
          </ListCard>

          <ListCard title="Permissions" isEmpty={(permissions.data?.length ?? 0) === 0} className="lg:col-span-2">
            <div className="flex flex-wrap gap-1.5">
              {(permissions.data ?? []).map((permission) => (
                <span
                  key={permission.id}
                  title={permission.description ?? undefined}
                  className="rounded-md bg-[#313335] px-2 py-1 text-[11px] font-medium text-[#c4c7ce]"
                >
                  {permission.name}
                </span>
              ))}
            </div>
          </ListCard>
        </div>
      </QueryState>

      <div className="mt-4">
        <MfaSettings />
      </div>

      {roleModal && (
        <NameModal
          kind="role"
          onClose={() => setRoleModal(false)}
          onSubmit={(payload) =>
            createRole.mutate(payload, {
              onSuccess: () => {
                toast.success('Role created');
                setRoleModal(false);
              },
              onError: (e) => toast.error(e.message),
            })
          }
          pending={createRole.isPending}
        />
      )}

      {groupModal && (
        <NameModal
          kind="group"
          onClose={() => setGroupModal(false)}
          onSubmit={(payload) =>
            createGroup.mutate(payload, {
              onSuccess: () => {
                toast.success('Group created');
                setGroupModal(false);
              },
              onError: (e) => toast.error(e.message),
            })
          }
          pending={createGroup.isPending}
        />
      )}
    </>
  );
};

const WorkspaceAccessPanel: React.FC = () => {
  const users = useUsers({ pageNumber: 0, pageSize: 1000, status: 'ACTIVE' });
  const workspaces = useAdminWorkspaces();
  const grant = useGrantWorkspaceAccess();
  const revoke = useRevokeWorkspaceAccess();
  const normalUsers = (users.data?.content ?? []).filter((user) => !(user.roles ?? []).includes('ADMIN'));
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [selectedTenantId, setSelectedTenantId] = React.useState<number | null>(null);
  const grants = useUserAccessGrants(selectedUserId);
  const grantedIds = new Set(grants.data ?? []);
  const selectedUser = normalUsers.find((user) => user.id === selectedUserId);
  const availableWorkspaces = (workspaces.data ?? []).filter((workspace) => workspace.status === 'ACTIVE');

  React.useEffect(() => {
    if (selectedUserId === null && normalUsers.length > 0) setSelectedUserId(normalUsers[0].id);
    if (selectedUserId !== null && !normalUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(normalUsers[0]?.id ?? null);
    }
  }, [normalUsers, selectedUserId]);
  React.useEffect(() => {
    if (selectedTenantId === null && availableWorkspaces.length > 0) setSelectedTenantId(availableWorkspaces[0].id);
    if (selectedTenantId !== null && !availableWorkspaces.some((workspace) => workspace.id === selectedTenantId)) {
      setSelectedTenantId(availableWorkspaces[0]?.id ?? null);
    }
  }, [availableWorkspaces, selectedTenantId]);

  const handleGrant = () => {
    if (!selectedUserId || !selectedTenantId || grantedIds.has(selectedTenantId)) return;
    grant.mutate({ userId: selectedUserId, tenantId: selectedTenantId }, {
      onSuccess: () => toast.success('Workspace access granted. The user must sign in again.'),
      onError: (error) => toast.error(error.message),
    });
  };
  const handleRevoke = (tenantId: number) => {
    if (!selectedUserId) return;
    revoke.mutate({ userId: selectedUserId, tenantId }, {
      onSuccess: () => toast.success('Workspace access revoked. The user must sign in again.'),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <Card className="mb-4 overflow-hidden border-[#3b4657] shadow-sm">
      <div className="flex items-start gap-3 border-b border-[#3c3f41] bg-[#20252d] px-4 py-3">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#6fa6ff]" />
        <div>
          <h2 className="text-[13px] font-semibold text-[#d7dae0]">Workspace access grants</h2>
          <p className="mt-0.5 text-[11px] leading-5 text-[#9da0a8]">
            Only the platform administrator can grant a normal user read access to another workspace. Changes apply after the user signs in again.
          </p>
        </div>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <label className="block text-[11px] font-medium uppercase tracking-wide text-[#8d95a2]">
          <span className="mb-1.5 flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" /> User</span>
          <select
            value={selectedUserId ?? ''}
            onChange={(event) => setSelectedUserId(event.target.value ? Number(event.target.value) : null)}
            className="w-full rounded-md border border-[#454a52] bg-[#181a1d] px-3 py-2 text-[13px] normal-case tracking-normal text-[#dfe1e5] outline-none focus:border-[#6fa6ff]"
            disabled={users.isLoading || normalUsers.length === 0}
          >
            {normalUsers.length === 0 && <option value="">No active normal users</option>}
            {normalUsers.map((user) => <option key={user.id} value={user.id}>{user.email ?? user.username}</option>)}
          </select>
        </label>
        <label className="block text-[11px] font-medium uppercase tracking-wide text-[#8d95a2]">
          <span className="mb-1.5 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Workspace to grant</span>
          <select
            value={selectedTenantId ?? ''}
            onChange={(event) => setSelectedTenantId(event.target.value ? Number(event.target.value) : null)}
            className="w-full rounded-md border border-[#454a52] bg-[#181a1d] px-3 py-2 text-[13px] normal-case tracking-normal text-[#dfe1e5] outline-none focus:border-[#6fa6ff]"
            disabled={workspaces.isLoading || availableWorkspaces.length === 0}
          >
            {availableWorkspaces.length === 0 && <option value="">No active workspaces</option>}
            {availableWorkspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name} · #{workspace.id}</option>)}
          </select>
        </label>
        <Button
          onClick={handleGrant}
          disabled={!selectedUser || !selectedTenantId || grantedIds.has(selectedTenantId) || grant.isPending}
          loading={grant.isPending}
          leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
        >
          {grantedIds.has(selectedTenantId ?? -1) ? 'Already granted' : 'Grant access'}
        </Button>
      </div>
      <div className="border-t border-[#3c3f41] px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-[#d7dae0]">Current visibility for {selectedUser?.email ?? selectedUser?.username ?? 'selected user'}</p>
            <p className="mt-0.5 text-[11px] text-[#7f8793]">The user's own workspace is always included and is not listed as a grant.</p>
          </div>
          {grants.isFetching && <span className="text-[11px] text-[#8d95a2]">Refreshing…</span>}
        </div>
        {grantedIds.size === 0 ? (
          <p className="rounded-md border border-dashed border-[#454a52] px-3 py-3 text-[12px] text-[#8d95a2]">No additional workspace access has been granted.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...grantedIds].map((tenantId) => {
              const workspace = (workspaces.data ?? []).find((item) => item.id === tenantId);
              return (
                <span key={tenantId} className="inline-flex items-center gap-1.5 rounded-md border border-[#3d5b7d] bg-[#1d2b3a] px-2.5 py-1.5 text-[11px] text-[#c8ddf7]">
                  <Building2 className="h-3 w-3" /> {workspace?.name ?? `Workspace #${tenantId}`}
                  <button type="button" aria-label={`Revoke workspace ${tenantId}`} className="ml-1 rounded p-0.5 text-[#8fb4df] hover:bg-[#29415a] hover:text-white" onClick={() => handleRevoke(tenantId)} disabled={revoke.isPending}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

const ListCard: React.FC<{
  title: string;
  isEmpty: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ title, isEmpty, className, children }) => (
  <Card className={className}>
    <div className="border-b border-[#3c3f41] px-4 py-3">
      <h2 className="text-[13px] font-semibold text-[#d7dae0]">{title}</h2>
    </div>
    <div className="px-4 py-2">
      {isEmpty ? <p className="py-3 text-[13px] text-[#9da0a8]">None</p> : <ul>{children}</ul>}
    </div>
  </Card>
);

const NameModal: React.FC<{
  kind: 'role' | 'group';
  onClose: () => void;
  onSubmit: (payload: { name: string; description?: string; status?: string }) => void;
  pending: boolean;
}> = ({ kind, onClose, onSubmit, pending }) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  return (
    <Modal
      open
      onClose={onClose}
      title={`New ${kind}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            disabled={name.trim().length === 0}
            loading={pending}
            onClick={() =>
              onSubmit({ name: name.trim(), ...(description.trim() ? { description: description.trim() } : {}) })
            }
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={kind === 'role' ? 'EVENT_MANAGER' : 'Back office'}
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />
      </div>
    </Modal>
  );
};

export default Access;
