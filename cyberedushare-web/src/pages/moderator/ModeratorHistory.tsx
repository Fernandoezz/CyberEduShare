import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface HistoryItem {
  _id: string;
  contentTitle: string;
  action: 'approved' | 'rejected' | 'requested_changes';
  timestamp: string;
  notes?: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: 'Approved', color: 'text-green-600' },
  rejected: { label: 'Rejected', color: 'text-red-600' },
  requested_changes: { label: 'Requested changes', color: 'text-yellow-600' },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${d.toLocaleDateString()}, ${timeStr}`;
}

function getLocalHistory(): HistoryItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem('moderationHistory') ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export default function ModeratorHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localItems = getLocalHistory();

    api.get('/admin/content/history')
      .then(r => {
        const raw = r.data?.history ?? r.data ?? [];
        const serverItems: HistoryItem[] = Array.isArray(raw) ? raw : [];

        // Merge: server items first, then local-only items not already in server list
        const serverIds = new Set(serverItems.map(i => i._id));
        const localOnly = localItems.filter(i => !serverIds.has(i._id));
        const merged = [...serverItems, ...localOnly];

        // Sort newest first
        merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistory(merged);
      })
      .catch(() => {
        // Backend unavailable — fall back to local history only
        setHistory(localItems);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Moderation History</h2>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">No moderation history yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {history.map(item => {
            const meta = ACTION_LABELS[item.action] ?? { label: item.action, color: 'text-gray-600' };
            return (
              <div key={item._id} className="px-5 py-4">
                <p className="text-sm text-gray-800">
                  <span className={`font-semibold ${meta.color}`}>{meta.label}:</span>{' '}
                  {item.contentTitle}{' '}
                  <span className="text-gray-400 text-xs">({formatTimestamp(item.timestamp)})</span>
                </p>
                {item.notes && (
                  <p className="text-xs text-gray-500 mt-0.5">Note: {item.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}