import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface FlaggedItem {
  _id: string;
  title: string;
  type: string;
  reason: string;
  reportedBy?: string;
  reportedAt?: string;
}

export default function ModeratorFlagged() {
  const [items, setItems] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/content/flagged')
      .then(r => setItems(r.data.content ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDismiss = async (id: string) => {
    try {
      await api.put(`/admin/content/${id}/unflag`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {
      alert('Failed to dismiss flag.');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this flagged content?')) return;
    try {
      await api.delete(`/admin/content/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {
      alert('Failed to remove content.');
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Flagged Content</h2>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🚩</div>
          <p className="text-gray-500 text-sm">No flagged content right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">
                  Reason:{' '}
                  <span className="text-gray-700">"{item.reason}"</span>
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDismiss(item._id)}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}