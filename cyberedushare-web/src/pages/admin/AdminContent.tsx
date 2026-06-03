import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Content } from '../../types';

export default function AdminContent() {
  const [tab,     setTab]     = useState<'pending' | 'all'>('pending');
  const [content, setContent] = useState<Content[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);

  const fetchContent = async () => {
  try {
    setLoading(true);
    const endpoint = tab === 'pending' ? '/admin/content/pending' : '/admin/content';
    const res = await api.get(endpoint, { params: { q: search, page, limit: 15 } });
    setContent(res.data.content);
    setTotal(res.data.total);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchContent(); }, [tab, search, page]);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/admin/content/${id}/approve`);
      setContent(prev => prev.filter(c => c._id !== id));
      setTotal(prev => prev - 1);
    } catch (e) { alert('Failed to approve'); }
  };

  const handleReject = async (id: string, title: string) => {
    const reason = prompt(`Reason for rejecting "${title}"?`);
    if (reason === null) return;
    try {
      await api.delete(`/admin/content/${id}`, { data: { reason } });
      setContent(prev => prev.filter(c => c._id !== id));
      setTotal(prev => prev - 1);
    } catch (e) { alert('Failed to reject'); }
  };

  const diffColor = (d: string) => {
    if (d === 'Easy')   return 'bg-green-100 text-green-700';
    if (d === 'Hard')   return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Content Management</h1>
          <p className="text-gray-500 text-sm">{total} {tab === 'pending' ? 'pending' : 'total'} resources</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            {t === 'pending' ? '⏳ Pending Approval' : '📚 All Content'}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Content list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : content.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {tab === 'pending' ? '✅ No pending content!' : 'No content found.'}
          </div>
        ) : content.map(item => (
          <div key={item._id} className="bg-white rounded-xl p-5 shadow-sm flex items-start gap-4">
            {/* Type badge */}
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-xs">{item.type}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {item.subject}
                </span>
                {item.isVerified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{item.description || 'No description'}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400">By {item.uploaderName}</span>
                <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                {item.fileUrl && (
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline">
                    View file ↗
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {!item.isVerified && (
                <button
                  onClick={() => handleApprove(item._id)}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✓ Approve
                </button>
              )}
              <button
                onClick={() => handleReject(item._id, item.title)}
                className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
              >
                ✕ Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">{total} total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(p => p+1)} disabled={page*15>=total}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}