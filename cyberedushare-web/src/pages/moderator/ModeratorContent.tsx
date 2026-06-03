import { useEffect, useState } from 'react';
import api from '../../api/axios';
export default function ModeratorContent() {
  const [content, setContent] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchContent = async () => { setLoading(true); try { const res = await api.get('/admin/content/pending'); setContent(res.data.content); setTotal(res.data.total); } catch(e){} setLoading(false); };
  useEffect(() => { fetchContent(); }, []);
  const handleApprove = async (id: string) => { try { await api.put(`/admin/content/${id}/approve`); setContent(p => p.filter(c => c._id !== id)); setTotal(p => p-1); } catch(e){ alert('Failed'); } };
  const handleReject = async (id: string) => { if (!confirm('Reject this resource?')) return; try { await api.delete(`/admin/content/${id}`); setContent(p => p.filter(c => c._id !== id)); setTotal(p => p-1); } catch(e){ alert('Failed'); } };
  return (
    <div className="p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Content Moderation</h1><p className="text-gray-500 text-sm">{total} pending</p></div>
      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> : content.length === 0 ? (
        <div className="text-center py-16"><div className="text-5xl mb-4">✅</div><h2 className="text-lg font-semibold text-gray-700">All caught up!</h2><p className="text-gray-400 text-sm">No content pending review.</p></div>
      ) : (
        <div className="space-y-3">
          {content.map((item:any) => (
            <div key={item._id} className="bg-white rounded-xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-amber-700 font-bold text-xs">{item.type}</span></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.subject} · By {item.uploaderName} · {new Date(item.createdAt).toLocaleDateString()}</p>
                {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View file ↗</a>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleApprove(item._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">✓ Approve</button>
                <button onClick={() => handleReject(item._id)} className="px-3 py-1.5 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200">✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}