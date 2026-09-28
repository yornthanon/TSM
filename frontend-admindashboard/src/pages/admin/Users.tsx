import React from 'react';
import { UserCheck, UserX, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  useActivateUser,
  useDeactivateUser,
  useUpdateUser,
  useUserStats,
  useUsers,
} from '../../hooks/useApi';
import { usePagedRows } from '../../hooks/usePagedRows';
import {
  PageHeader,
  Pager,
  QueryState,
  StatCard,
  Table,
  Td,
  Th,
} from '../../components/QueryState';
import { Badge, Button, Card, ConfirmDialog, Input, Modal } from '../../components/ui';
import { formatDateTime } from '../../utils';
import type { User, UserPayload } from '../../types/api';

const Users: React.FC = () => {
  const users = useUsers();
  const userStats = useUserStats();
  const updateUser = useUpdateUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [editTarget, setEditTarget] = React.useState<User | null>(null);
  const [deactivateTarget, setDeactivateTarget] = React.useState<User | null>(null);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return (users.data ?? []).filter((user) => {
      const matchesTerm =
        !term ||
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || (user.status ?? '').toUpperCase() === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [users.data, search, statusFilter]);

  const paged = usePagedRows(filtered, 10);
  const byStatus = userStats.data?.byStatus ?? {};

  return (
    <>
      <PageHeader
        title="Users"
        description="Accounts registered with the ticketing platform."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Users" value={userStats.data?.total ?? users.data?.length ?? 0} />
        <StatCard label="Active" value={byStatus.ACTIVE ?? '-'} tone="good" />
        <StatCard label="Inactive" value={byStatus.INACTIVE ?? '-'} />
        <StatCard label="Registered today" value={userStats.data?.registeredToday ?? '-'} />
      </div>

      <Card className="mb-4 p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search username, name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={Search}
              aria-label="Search users"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-[#e7e7eb] bg-white px-3 py-2 text-[13px] text-[#3d3d47]"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </Card>

      <QueryState
        isLoading={users.isLoading}
        error={users.error}
        isEmpty={filtered.length === 0}
        onRetry={() => void users.refetch()}
        emptyTitle={search || statusFilter ? 'No users match your filters' : 'No users yet'}
        emptyDescription="Users register through the public API."
      >
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Roles</Th>
              <Th>Status</Th>
              <Th>Last login</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paged.visible.map((user) => (
              <tr key={user.id} className="border-t border-[#f0f0f3]">
                <Td>
                  <p className="font-medium">{user.username}</p>
                  {(user.firstName || user.lastName) && (
                    <p className="mt-0.5 text-[12px] text-[#9b9ba6]">
                      {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                    </p>
                  )}
                </Td>
                <Td className="text-[#777783]">{user.email ?? '-'}</Td>
                <Td className="text-[#777783]">
                  {(user.roles ?? []).length > 0 ? user.roles!.join(', ') : '-'}
                </Td>
                <Td>
                  <Badge status={user.status ?? 'UNKNOWN'} />
                </Td>
                <Td className="whitespace-nowrap text-[#777783]">
                  {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditTarget(user)}
                    >
                      Edit
                    </Button>
                    {user.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        title="Deactivate"
                        aria-label={`Deactivate ${user.username}`}
                        onClick={() => setDeactivateTarget(user)}
                        className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        title="Activate"
                        aria-label={`Activate ${user.username}`}
                        onClick={() =>
                          activateUser.mutate(user.id, {
                            onSuccess: () => toast.success(`${user.username} activated`),
                            onError: (e) => toast.error(e.message),
                          })
                        }
                        className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          onChange={paged.setPage}
        />
      </QueryState>

      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(payload) =>
            updateUser.mutate(
              { id: editTarget.id, payload },
              {
                onSuccess: () => {
                  toast.success('User updated');
                  setEditTarget(null);
                },
                onError: (e) => toast.error(e.message),
              }
            )
          }
          pending={updateUser.isPending}
        />
      )}

      <ConfirmDialog
        open={deactivateTarget !== null}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => {
          if (!deactivateTarget) return;
          deactivateUser.mutate(deactivateTarget.id, {
            onSuccess: () => {
              toast.success(`${deactivateTarget.username} deactivated`);
              setDeactivateTarget(null);
            },
            onError: (e) => {
              toast.error(e.message);
              setDeactivateTarget(null);
            },
          });
        }}
        title="Deactivate user"
        description={`${deactivateTarget?.username ?? ''} will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        loading={deactivateUser.isPending}
      />
    </>
  );
};

const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onSubmit: (payload: Partial<UserPayload>) => void;
  pending: boolean;
}> = ({ user, onClose, onSubmit, pending }) => {
  const [form, setForm] = React.useState({
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phoneNumber: user.phoneNumber ?? '',
  });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.username}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                firstName: form.firstName || null,
                lastName: form.lastName || null,
                email: form.email || null,
                phoneNumber: form.phoneNumber || null,
              })
            }
            loading={pending}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input label="First name" value={form.firstName} onChange={update('firstName')} />
        <Input label="Last name" value={form.lastName} onChange={update('lastName')} />
        <Input label="Email" type="email" value={form.email} onChange={update('email')} />
        <Input label="Phone" value={form.phoneNumber} onChange={update('phoneNumber')} />
        <p className="text-[11px] text-[#9b9ba6]">
          Username and role assignments are owned by the auth service and are not editable here.
        </p>
      </div>
    </Modal>
  );
};

export default Users;
