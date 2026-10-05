import React from 'react';
import { Plus, Search, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import {
  useActivateUser,
  useCreateUser,
  useDeactivateUser,
  useDeleteUser,
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
import { auth } from '../../lib/auth';

type ContextMenuState =
  | { kind: 'create'; x: number; y: number }
  | { kind: 'delete'; x: number; y: number; user: User };

const Users: React.FC = () => {
  const users = useUsers();
  const userStats = useUserStats();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const currentUser = auth.getUser();
  const isPlatformAdmin = currentUser?.role === 'ADMIN';
  const currentEmail = currentUser?.email?.trim().toLowerCase();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [editTarget, setEditTarget] = React.useState<User | null>(null);
  const [deactivateTarget, setDeactivateTarget] = React.useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState<ContextMenuState | null>(null);

  const isProtectedAdmin = (user: User) =>
    (user.roles ?? []).includes('ADMIN') || user.email?.trim().toLowerCase() === currentEmail;

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

  const handlePageContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlatformAdmin) return;
    const target = event.target as HTMLElement;
    if (target.closest('tr,button,input,select,a,[role="dialog"]')) return;
    event.preventDefault();
    setContextMenu({ kind: 'create', x: event.clientX, y: event.clientY });
  };

  const handleUserContextMenu = (event: React.MouseEvent<HTMLTableRowElement>, user: User) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isPlatformAdmin || isProtectedAdmin(user)) return;
    setContextMenu({ kind: 'delete', user, x: event.clientX, y: event.clientY });
  };

  const handleCreate = (payload: UserPayload) => {
    createUser.mutate(payload, {
      onSuccess: (created) => {
        toast.success(`Google account ${created.email ?? created.username} added`);
        setCreateOpen(false);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`${deleteTarget.username} deleted; workspace data was retained`);
        setDeleteTarget(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const menuLeft = contextMenu
    ? Math.max(8, Math.min(contextMenu.x, window.innerWidth - 224))
    : 0;
  const menuTop = contextMenu
    ? Math.max(8, Math.min(contextMenu.y, window.innerHeight - 88))
    : 0;

  return (
    <div className="relative" onContextMenu={handlePageContextMenu}>
      <PageHeader
        title="Users"
        description="Global account directory. Right-click or two-finger click the page for Create and a user row for Delete."
        actions={isPlatformAdmin && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Create user
          </Button>
        )}
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
            className="rounded-lg border border-[#3c3f41] bg-white px-3 py-2 text-[13px] text-[#c4c7ce]"
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
        emptyDescription="Verified Google accounts enroll automatically in isolated workspaces. Create here to pre-register a verified Google email."
        emptyAction={isPlatformAdmin && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Create user
          </Button>
        )}
      >
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Roles</Th>
              <Th>Status</Th>
              <Th>Last login</Th>
              {isPlatformAdmin && <Th className="text-right">Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {paged.visible.map((user) => {
              const protectedAdmin = isProtectedAdmin(user);
              return (
                <tr
                  key={user.id}
                  className="border-t border-[#3c3f41]"
                  onContextMenu={(event) => handleUserContextMenu(event, user)}
                >
                  <Td>
                    <p className="font-medium">{user.username}</p>
                    {(user.firstName || user.lastName) && (
                      <p className="mt-0.5 text-[12px] text-[#9da0a8]">
                        {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </Td>
                  <Td className="text-[#9da0a8]">{user.email ?? '-'}</Td>
                  <Td className="text-[#9da0a8]">
                    {(user.roles ?? []).length > 0 ? user.roles!.join(', ') : '-'}
                  </Td>
                  <Td>
                    <Badge status={user.status ?? 'UNKNOWN'} />
                  </Td>
                  <Td className="whitespace-nowrap text-[#9da0a8]">
                    {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                  </Td>
                  {isPlatformAdmin && <Td>
                    <div className="flex items-center justify-end gap-2">
                      {!protectedAdmin && (
                        <Button variant="secondary" size="sm" onClick={() => setEditTarget(user)}>
                          Edit
                        </Button>
                      )}
                      {!protectedAdmin && (user.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          title="Deactivate"
                          aria-label={`Deactivate ${user.username}`}
                          onClick={() => setDeactivateTarget(user)}
                          className="rounded-md p-1.5 text-rose-400 hover:bg-[#2b2d30]"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Activate"
                          aria-label={`Activate ${user.username}`}
                          onClick={() => activateUser.mutate(user.id, {
                            onSuccess: () => toast.success(`${user.username} activated`),
                            onError: (error) => toast.error(error.message),
                          })}
                          className="rounded-md p-1.5 text-emerald-400 hover:bg-[#2b2d30]"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </button>
                      ))}
                      {!protectedAdmin && (
                        <button
                          type="button"
                          title="Delete user"
                          aria-label={`Delete ${user.username}`}
                          onClick={() => setDeleteTarget(user)}
                          className="rounded-md p-1.5 text-rose-400 hover:bg-[#2b2d30]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </Td>}
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Pager
          page={paged.page}
          totalPages={paged.totalPages}
          total={paged.total}
          onChange={paged.setPage}
        />
      </QueryState>

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setContextMenu(null)}
            onContextMenu={(event) => { event.preventDefault(); setContextMenu(null); }}
          />
          <div
            role="menu"
            aria-label="User management quick actions"
            className="fixed z-50 min-w-52 rounded-lg border border-[#3c3f41] bg-[#1e1f22] p-1 shadow-xl"
            style={{ left: menuLeft, top: menuTop }}
          >
            {contextMenu.kind === 'create' ? (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#dfe1e5] hover:bg-[#2b2d30]"
                onClick={() => { setContextMenu(null); setCreateOpen(true); }}
              >
                <Plus className="h-3.5 w-3.5 text-[#4ec9b0]" /> Create user
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-[#f07178] hover:bg-[#2b2d30]"
                onClick={() => { setContextMenu(null); setDeleteTarget(contextMenu.user); }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete {contextMenu.user.username}
              </button>
            )}
          </div>
        </>
      )}

      {createOpen && (
        <CreateUserModal
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          pending={createUser.isPending}
        />
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(payload) => updateUser.mutate(
            { id: editTarget.id, payload },
            {
              onSuccess: () => { toast.success('User updated'); setEditTarget(null); },
              onError: (error) => toast.error(error.message),
            },
          )}
          pending={updateUser.isPending}
        />
      )}

      <ConfirmDialog
        open={deactivateTarget !== null}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => {
          if (!deactivateTarget) return;
          deactivateUser.mutate(deactivateTarget.id, {
            onSuccess: () => { toast.success(`${deactivateTarget.username} deactivated`); setDeactivateTarget(null); },
            onError: (error) => { toast.error(error.message); setDeactivateTarget(null); },
          });
        }}
        title="Deactivate user"
        description={`${deactivateTarget?.username ?? ''} will no longer be able to sign in. The account and workspace data remain recoverable.`}
        confirmLabel="Deactivate"
        loading={deactivateUser.isPending}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Permanently delete ${deleteTarget?.username ?? 'user'}?`}
        description="This permanently deletes the login identity and revokes its refresh sessions. The workspace and business records are retained, but the owner link is cleared; the deleted account will not be able to return to that workspace. Use Deactivate for a reversible block."
        confirmLabel="Delete user permanently"
        loading={deleteUser.isPending}
      />
    </div>
  );
};

const CreateUserModal: React.FC<{
  onClose: () => void;
  onSubmit: (payload: UserPayload) => void;
  pending: boolean;
}> = ({ onClose, onSubmit, pending }) => {
  const [form, setForm] = React.useState({ username: '', email: '', firstName: '', lastName: '' });

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const generatedPassword = globalThis.crypto.randomUUID();
    onSubmit({
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      firstName: form.firstName.trim() || null,
      lastName: form.lastName.trim() || null,
      password: generatedPassword,
      userType: 'USER',
      status: 'ACTIVE',
      roles: ['USER'],
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Create Google user"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" form="create-google-user-form" loading={pending}>Create user</Button>
        </>
      )}
    >
      <form id="create-google-user-form" onSubmit={submit} className="space-y-3">
        <p className="text-xs leading-5 text-[#9da0a8]">
          Pre-register the account with its Google email. Google must verify that email at sign-in; a private workspace is created on its first successful login. No password is shown or sent to the user.
        </p>
        <Input label="Username" value={form.username} onChange={update('username')} required autoComplete="off" pattern="[A-Za-z0-9_]+" maxLength={50} title="Use letters, numbers, and underscores only." />
        <Input label="Google email" type="email" value={form.email} onChange={update('email')} required autoComplete="email" maxLength={100} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="First name" value={form.firstName} onChange={update('firstName')} />
          <Input label="Last name" value={form.lastName} onChange={update('lastName')} />
        </div>
        <p className="text-[11px] text-[#868a91]">A one-time random password is stored only as a hash; password login remains disabled.</p>
      </form>
    </Modal>
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

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.username}`}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button
            onClick={() => onSubmit({
              firstName: form.firstName || null,
              lastName: form.lastName || null,
              email: form.email || null,
              phoneNumber: form.phoneNumber || null,
            })}
            loading={pending}
          >Save</Button>
        </>
      )}
    >
      <div className="space-y-3">
        <Input label="First name" value={form.firstName} onChange={update('firstName')} />
        <Input label="Last name" value={form.lastName} onChange={update('lastName')} />
        <Input label="Email" type="email" value={form.email} onChange={update('email')} />
        <Input label="Phone" value={form.phoneNumber} onChange={update('phoneNumber')} />
        <p className="text-[11px] text-[#9da0a8]">Username and role assignments are managed by the auth service.</p>
      </div>
    </Modal>
  );
};

export default Users;
