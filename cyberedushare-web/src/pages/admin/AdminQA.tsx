import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Question } from '../../types';

export default function AdminQA() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchQuestions = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/questions', { params: { page, limit: 15 } }); setQuestions(res.data.questions); setTotal(res.data.total); } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { fetchQuestions(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try { await api.delete(`/admin/questions/${id}`); setQuestions(prev => prev.filter(q => q._id !== id)); setTotal(p => p-1); } catch (e) { alert('Failed'); }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Q&A Management</h1>
        <p className="text-gray-500 text-sm">{total} questions</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Question</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Asked By</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
            : questions.map(q => (
              <tr key={q._id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><p className="text-sm font-medium text-gray-800 max-w-xs truncate">{q.title}</p></td>
                <td className="px-6 py-4"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{q.subject}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{q.askedByName}</td>
                <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${q.isSolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{q.isSolved ? 'Solved' : 'Open'}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4"><button onClick={() => handleDelete(q._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 15 && (
        <div className="flex justify-between mt-4">
          <span className="text-sm text-gray-500">{total} total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(p => p+1)} disabled={page*15>=total} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}