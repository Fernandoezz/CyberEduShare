import { useEffect, useState } from 'react';
import api from '../../api/axios';
export default function ModeratorQA() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const fetchQ = async () => { setLoading(true); try { const res = await api.get('/admin/questions', {params:{page,limit:15}}); setQuestions(res.data.questions); setTotal(res.data.total); } catch(e){} setLoading(false); };
  useEffect(() => { fetchQ(); }, [page]);
  const handleDelete = async (id: string) => { if (!confirm('Delete this question?')) return; try { await api.delete(`/admin/questions/${id}`); setQuestions(p => p.filter(q => q._id !== id)); } catch(e){ alert('Failed'); } };
  return (
    <div className="p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Q&A Moderation</h1><p className="text-gray-500 text-sm">{total} questions</p></div>
      <div className="space-y-3">
        {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> : questions.map((q:any) => (
          <div key={q._id} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{q.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{q.subject}</span>
                <span className="text-xs text-gray-400">By {q.askedByName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${q.isSolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{q.isSolved ? 'Solved' : 'Open'}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(q._id)} className="text-red-500 hover:text-red-700 text-sm flex-shrink-0">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}