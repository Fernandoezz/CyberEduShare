import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Project } from '../../types';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProjects = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/projects', { params: { page, limit: 12 } }); setProjects(res.data.projects); setTotal(res.data.total); } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { fetchProjects(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try { await api.delete(`/admin/projects/${id}`); setProjects(prev => prev.filter(p => p._id !== id)); setTotal(p => p-1); } catch (e) { alert('Failed'); }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        <p className="text-gray-500 text-sm">{total} projects submitted</p>
      </div>
      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p._id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800 text-sm flex-1 mr-2">{p.title}</h3>
                <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">Delete</button>
              </div>
              <p className="text-xs text-blue-600 mb-2">{p.subject}</p>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {p.techStack.map(t => <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>)}
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>By {p.submittedByName}</span>
                <span>❤️ {p.likes?.length || 0} · 💬 {p.comments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {total > 12 && (
        <div className="flex justify-between mt-4">
          <span className="text-sm text-gray-500">{total} total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(p => p+1)} disabled={page*12>=total} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}