import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { User, Role } from '../../types';

const ROLES: Role[] = ['student', 'faculty', 'moderator', 'admin'];

export default function AdminRoleAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser]       = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>('student');
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/users/${id}`)
      .then(r => {
        // Backend returns { user: {...} } — unwrap it safely
        const userData: User = r.data.user ?? r.data;
        setUser(userData);
        setNewRole(userData.role);
      })
      .catch(() => setError('Failed to load user.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id || !user) return;
    setSaving(true);
    setError(null);
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      navigate('/admin/users');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  if (!user)   return <div className="p-8 text-sm text-gray-500">User not found.</div>;

  return (
    <div className="p-8 max-w-xl">
      <h2 className="text-base font-semibold text-gray-700 mb-6">Change User Role</h2>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <p><span className="font-medium">User:</span> {user.username.toUpperCase()}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">Current Role:</span> <span className="capitalize">{user.role}</span></p>
          <div className="flex items-center gap-2">
            <span className="font-medium">New Role:</span>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5">
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as Role)}
                className="text-sm text-gray-700 outline-none bg-transparent capitalize"
              >
                {ROLES.map(r => (
                  <option key={r} value={r} className="capitalize">{r.toUpperCase()}</option>
                ))}
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        {newRole !== user.role && !error && (
          <p className="text-xs text-red-500 font-medium mb-5">
            Warning: Changing roles affects access immediately.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || newRole === user.role}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}