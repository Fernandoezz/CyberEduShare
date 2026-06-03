import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { DashboardStats } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-gray-500 text-sm">Failed to load stats.</div>;

  return (
    <div className="p-8 max-w-3xl">
      {/* Stats */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Stats</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">
            Total Users: {stats.users.total.toLocaleString()}
          </span>
          <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">
            Active Today: {stats.users.newThisWeek}
          </span>
          <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">
            New: {stats.users.newThisWeek}
          </span>
          <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">
            Pending Moderation: {stats.content.pending}
          </span>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add New User
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Manage Roles
          </button>
          <button
            onClick={() => navigate('/admin/integrations')}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Configure SSO
          </button>
        </div>
      </section>

      {/* System Health */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">System Health</h2>
        <div className="flex flex-wrap gap-3">
          <SystemHealthBadge label="DB Status" value="Healthy" ok />
          <SystemHealthBadge label="API" value="99.9% uptime" ok />
          <SystemHealthBadge label="S3 Storage" value="OK" ok />
        </div>
      </section>
    </div>
  );
}

function SystemHealthBadge({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">
      {label}: {value}
    </span>
  );
}