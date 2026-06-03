import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { User } from '../../types';

const ROLES = ['student', 'faculty', 'moderator', 'admin'];

export default function AdminUsers() {
  const [users, setUsers]         = useState<User[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage]           = useState(1);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { q: search, role: roleFilter, page, limit: 15 },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setTotal(prev => prev - 1);
    } catch { alert('Failed to delete user'); }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Users</h2>

      {/* Search + Role filter */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="text-sm text-gray-700 placeholder-gray-400 flex-1 outline-none"
          />
        </div>
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white gap-2">
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="text-sm text-gray-600 outline-none bg-transparent"
          >
            <option value="">Role</option>
            {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div
              key={user._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{user.username[0].toUpperCase()}</span>
                </div>
                <span className="text-sm text-gray-700">
                  All |{' '}
                  <span className="font-medium capitalize">{user.role}</span>
                </span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/admin/users/${user._id}/role`)}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Change Role
                </button>
                <button
                  onClick={() => handleDelete(user._id, user.username)}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-gray-500">
            {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >Previous</button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 15 >= total}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}