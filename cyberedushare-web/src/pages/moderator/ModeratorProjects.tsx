import { useEffect, useState } from 'react';
import api from '../../api/axios';
export default function ModeratorProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const fetchP = async () => { setLoading(true); try { const res = await api.get('/admin/projects'); setProjects(res.data.projects); setTotal(res.data.total); } catch(e){} setLoading(false); };
  useEffect(() => { fetchP(); }, []);
  const handleDelete = async (id: string) => { if (!confirm('Delete this project?')) return; try { await api.delete(`/admin/projects/${id}`); setProjects(p => p.filter(x => x._id !== id)); } catch(e){ alert('Failed'); } };
  return (
    <div className="p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Projects Moderation</h1><p className="text-gray-500 text-sm">{total} projects</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-10 text-gray-400">Loading...</div> : projects.map((p:any) => (
          <div key={p._id} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800 text-sm flex-1 mr-2">{p.title}</h3>
              <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">Delete</button>
            </div>
            <p className="text-xs text-blue-600 mb-2">{p.subject}</p>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
            <div className="flex justify-between text-xs text-gray-400"><span>By {p.submittedByName}</span><span>❤️ {p.likes?.length||0}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}