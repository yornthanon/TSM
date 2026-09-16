import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { User, RoleType } from '../types/index';
import {
  Users,
  Shield,
  UserPlus,
  KeyRound,
  CheckCircle2,
  X,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';
import { useLanguage } from '../i18n';

export const UsersView: React.FC = () => {
  const { isKhmer } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<RoleType>('ROLE_USER');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<'username' | 'role' | 'createdAt'>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.request<User[]>('GET', '/api/v1/users');
      if (res.data) setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewPhone(user.phoneNumber);
    setNewRole(user.role);
    setShowAddModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(isKhmer ? `លុបអ្នកប្រើប្រាស់ «${user.username}» មែនទេ?` : `Delete user “${user.username}”?`)) return;
    const res = await api.request('DELETE', `/api/v1/users/${user.id}`);
    if (!res.error) { setFeedback(isKhmer ? 'លុបអ្នកប្រើប្រាស់បានជោគជ័យ' : 'User deleted successfully'); fetchUsers(); }
    else setFeedback(`${isKhmer ? 'លុបមិនបានសម្រេច' : 'Delete failed'}: ${res.description}`);
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    try {
      const payload = {
        username: newUsername,
        email: newEmail,
        phoneNumber: newPhone,
        role: newRole,
        roles: [newRole],
        status: editingUser?.status || 'ACTIVE',
      };
      const res = await api.request(editingUser ? 'PUT' : 'POST', editingUser ? `/api/v1/users/${editingUser.id}` : '/api/v1/auth/register', payload);

      if (!res.error) {
        setFeedback(editingUser ? (isKhmer ? 'បានកែប្រែអ្នកប្រើប្រាស់ជោគជ័យ' : 'User updated successfully') : `User ${newUsername} successfully registered with role ${newRole}!`);
        setShowAddModal(false);
        setEditingUser(null);
        setNewUsername('');
        setNewEmail('');
        setNewPhone('');
        fetchUsers();
      } else {
        setFeedback(`${isKhmer ? 'រក្សាទុកមិនបានសម្រេច' : 'Save failed'}: ${res.description}`);
      }
    } catch (err: any) {
      setFeedback(`Registration error: ${err.message}`);
    }
  };

  const handleSwitchUser = async (user: User) => {
    const res = await api.request('POST', '/api/v1/auth/login', {
      username: user.username,
      password: 'password123',
    });
    if (!res.error) {
      setFeedback(`Active session switched to "${user.username}" (${user.role}). JWT token updated!`);
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const left = sortBy === 'role' ? a.role : sortBy === 'createdAt' ? a.createdAt : a.username;
    const right = sortBy === 'role' ? b.role : sortBy === 'createdAt' ? b.createdAt : b.username;
    const result = left.localeCompare(right);
    return sortDirection === 'asc' ? result : -result;
  });

  return (
    <div id="users-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>{isKhmer ? 'អ្នកប្រើប្រាស់ និងសិទ្ធិ RBAC' : 'Users & RBAC Security'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isKhmer ? 'គ្រប់គ្រងតួនាទី សិទ្ធិ និងគណនីអ្នកប្រើប្រាស់' : 'Manage roles, permissions, and user accounts'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isKhmer ? 'បង្កើតអ្នកប្រើប្រាស់' : 'New user'}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ, email ឬតួនាទី...' : 'Search by username, email, or role...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
            <option value="username">{isKhmer ? 'ឈ្មោះ' : 'Name'}</option>
            <option value="role">{isKhmer ? 'តួនាទី' : 'Role'}</option>
            <option value="createdAt">{isKhmer ? 'កាលបរិច្ឆេទ' : 'Created'}</option>
          </select>
          <button onClick={() => setSortDirection((value) => value === 'asc' ? 'desc' : 'asc')} className="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">{sortDirection === 'asc' ? '↑' : '↓'}</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-soft">
        {loading && <div className="p-8 space-y-3">{[1, 2, 3].map((row) => <div key={row} className="h-10 rounded-lg bg-slate-100 animate-pulse" />)}</div>}
        {!loading && filteredUsers.length === 0 && <div className="p-12 text-center"><Users className="w-8 h-8 mx-auto text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">{isKhmer ? 'រកមិនឃើញអ្នកប្រើប្រាស់' : 'No users found'}</p><p className="mt-1 text-xs text-slate-400">{isKhmer ? 'សាកល្បងពាក្យស្វែងរកផ្សេងទៀត' : 'Try another search term'}</p></div>}
        {!loading && filteredUsers.length > 0 && <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">{isKhmer ? 'អ្នកប្រើប្រាស់' : 'User'}</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">{isKhmer ? 'ទូរស័ព្ទ' : 'Phone'}</th>
              <th className="px-4 py-3">{isKhmer ? 'តួនាទី' : 'Role'}</th>
              <th className="px-4 py-3">{isKhmer ? 'ស្ថានភាព' : 'Status'}</th>
              <th className="px-4 py-3 text-right">{isKhmer ? 'សកម្មភាព' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => {
              const isCurrent = api.getCurrentUser().username === user.username;
              return (
                <tr key={user.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                          <span>{user.username}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              {isKhmer ? 'កំពុងប្រើ' : 'ACTIVE NOW'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">ID #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{user.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === 'ROLE_ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'ROLE_ORGANIZER'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>{user.role}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditUser(user)} className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" title={isKhmer ? 'កែប្រែ' : 'Edit'}><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteUser(user)} className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600" title={isKhmer ? 'លុប' : 'Delete'}><Trash2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleSwitchUser(user)} disabled={isCurrent} className={`px-3 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 ${isCurrent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}><KeyRound className="w-3 h-3" /><span>{isCurrent ? (isKhmer ? 'កំពុងប្រើ' : 'Logged in') : (isKhmer ? 'ចូលជា user' : 'Login')}</span></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>}
      </div>

      {/* Register Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            id="register-user-modal"
            className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs modal-scroll"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">{editingUser ? (isKhmer ? 'កែប្រែអ្នកប្រើប្រាស់' : 'Edit user') : (isKhmer ? 'បង្កើតអ្នកប្រើប្រាស់ថ្មី' : 'Register new user')}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterUser} className="space-y-3">
              <div>
                  <label className="block text-slate-700 font-semibold mb-1">{isKhmer ? 'ឈ្មោះអ្នកប្រើប្រាស់ *' : 'Username *'}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dara_organizer"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. dara@events.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                  <label className="block text-slate-700 font-semibold mb-1">{isKhmer ? 'លេខទូរស័ព្ទ *' : 'Phone number *'}</label>
                <input
                  type="text"
                  required
                  placeholder="+85512345678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                  <label className="block text-slate-700 font-semibold mb-1">{isKhmer ? 'តួនាទី' : 'Role'}</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-semibold text-slate-800"
                >
                  <option value="ROLE_USER">ROLE_USER (Customer)</option>
                  <option value="ROLE_ORGANIZER">ROLE_ORGANIZER (Event Planner)</option>
                  <option value="ROLE_ADMIN">ROLE_ADMIN (Super Administrator)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100"
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium shadow-xs"
                >
                  {isKhmer ? 'បង្កើតគណនី' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
