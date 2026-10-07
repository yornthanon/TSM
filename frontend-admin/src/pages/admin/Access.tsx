import React from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateGroup, useCreateRole, useGroups, usePermissions, useRoles } from 'frontend-shared/hooks/useApi';
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
