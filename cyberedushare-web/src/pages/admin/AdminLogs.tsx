import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface AuditLog {
  _id: string;
  action: string;
  performedBy: string;
  performedByName: string;
  details?: string;
  createdAt: string;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AdminLogs() {
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/logs', { params: { page, limit: 20 } })
      .then(r => {
        setLogs(r.data.logs ?? r.data ?? []);
        setTotal(r.data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Audit Logs</h2>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No audit logs found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {logs.map(log => (
            <div key={log._id} className="px-5 py-4">
              <p className="text-sm text-gray-800">
                {log.action}
                {log.details ? `: ${log.details}` : ''}{' '}
                <span className="text-gray-500">| By Admin {log.performedByName}</span>{' '}
                <span className="text-gray-400 text-xs">| {formatTime(log.createdAt)}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-gray-500">Page {page}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >Previous</button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
