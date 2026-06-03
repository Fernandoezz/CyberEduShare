import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function StudentSearch() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const q = searchParams.get('q') || '';

  const search = async () => {
    setLoading(true);
    try {
      const res = await api.get('/content/search', { params: { q, subject, difficulty, type, page, limit: 10 } });
      setResults(res.data.results || []);
      setTotal(res.data.total || 0);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { search(); }, [q, subject, difficulty, type, page]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <select value={subject} onChange={e => { setSubject(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Subject ▾</option>
          {['CS101','CS102','CS201','CS205','Networks','Cryptography','OS'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Difficulty ▾</option>
          {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Type ▾</option>
          {['PDF','Video','ZIP','Image'].map(t => <option key={t}>{t}</option>)}
        </select>
        {(subject || difficulty || type) && (
          <button onClick={() => { setSubject(''); setDifficulty(''); setType(''); }} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">Clear</button>
        )}
      </div>

      <h2 className="text-sm font-semibold text-gray-700 mb-3">Result</h2>

      {loading ? <div className="text-sm text-gray-400">Searching...</div> : (
        <div className="space-y-3">
          {results.map((r: any) => (
            <div key={r._id} className="border border-gray-100 rounded-lg p-4 bg-white">
              <p className="text-sm font-semibold text-gray-800">{r.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.description || 'Short desc...'}</p>
              <p className="text-xs text-gray-500 mt-1">Tags: {r.subject} | {r.difficulty} | {r.type}</p>
              <p className="text-xs text-gray-400">Rating {'★'.repeat(Math.round(r.averageRating || 0))} ({r.averageRating?.toFixed(1) || '0.0'})</p>
              <div className="flex gap-2 mt-3 justify-end">
                {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"><button className="bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-600">Preview</button></a>}
                <button className="bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-600">Save</button>
                {r.fileUrl && <a href={r.fileUrl} download><button className="bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-600">Download</button></a>}
              </div>
            </div>
          ))}
          {results.length === 0 && <div className="text-sm text-gray-400">No results found.</div>}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="disabled:opacity-40">◄ Prev</button>
          {[...Array(Math.min(totalPages, 5))].map((_, i) => (
            <button key={i} onClick={() => setPage(i+1)} className={`w-6 h-6 rounded ${page===i+1?'bg-indigo-500 text-white':'hover:bg-gray-100'}`}>{i+1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="disabled:opacity-40">Next ►</button>
        </div>
      )}
    </div>
  );
}