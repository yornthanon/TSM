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
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<RoleType>('ROLE_USER');
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    try {
      const res = await api.request('POST', '/api/v1/auth/register', {
        username: newUsername,
        email: newEmail,
        phoneNumber: newPhone,
        role: newRole,
      });

      if (!res.error) {
        setFeedback(`User ${newUsername} successfully registered with role ${newRole}!`);
        setShowAddModal(false);
        setNewUsername('');
        setNewEmail('');
        setNewPhone('');
        fetchUsers();
      } else {
        setFeedback(`Registration error: ${res.description}`);
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
  );

  return (
    <div id="users-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>User & RBAC Security Management (user-service :8081)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control, JWT generation, password encryption (BCrypt), and refresh tokens
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New User</span>
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
            placeholder="Search by username, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Switch Active Session</th>
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
                              ACTIVE NOW
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
                    <button
                      onClick={() => handleSwitchUser(user)}
                      disabled={isCurrent}
                      className={`px-3 py-1 rounded text-[11px] font-medium transition flex items-center space-x-1 ml-auto ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>{isCurrent ? 'Logged In' : 'Login as User'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Register Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            id="register-user-modal"
            className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Register New User</h3>
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
                <label className="block text-slate-700 font-semibold mb-1">Username *</label>
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
                <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
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
                <label className="block text-slate-700 font-semibold mb-1">Role</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium shadow-xs"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
