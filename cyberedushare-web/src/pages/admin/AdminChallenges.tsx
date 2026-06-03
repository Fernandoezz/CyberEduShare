import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Challenge } from '../../types';

const EMPTY = { title: '', description: '', category: 'Web', difficulty: 'Medium' as const, flag: '', hints: [{ text: '', penalty: 10 }] };
const CATEGORIES = ['Web','Crypto','Forensics','Reverse','Pwn','OSINT','Misc'];
const DIFF_COLORS: Record<string,string> = { Easy: 'bg-green-100 text-green-700', Medium: 'bg-amber-100 text-amber-700', Hard: 'bg-red-100 text-red-700' };

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const fetchChallenges = async () => {
    setLoading(true);
    try { const res = await api.get('/challenges', { params: { category: filterCat } }); setChallenges(res.data); } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { fetchChallenges(); }, [filterCat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/challenges/create', { ...form, hints: form.hints.filter(h => h.text.trim()) });
      setShowForm(false); setForm(EMPTY); fetchChallenges();
    } catch (e) { alert('Failed to create challenge'); }
    setSaving(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">CTF Challenges</h1>
          <p className="text-gray-500 text-sm">{challenges.length} challenges</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ Create Challenge</button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterCat('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!filterCat ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>All</button>
        {CATEGORIES.map(c => <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filterCat===c ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>{c}</button>)}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">Create Challenge</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value as any}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flag *</label>
                <input value={form.flag} onChange={e => setForm(f => ({...f, flag: e.target.value}))} placeholder="FLAG{...}" required className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Hints</label>
                  <button type="button" onClick={() => setForm(f => ({...f, hints: [...f.hints, {text:'',penalty:10}]}))} className="text-blue-600 text-xs">+ Add hint</button>
                </div>
                {form.hints.map((hint, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={hint.text} onChange={e => setForm(f => ({...f, hints: f.hints.map((h,idx) => idx===i ? {...h, text: e.target.value} : h)}))} placeholder="Hint text..." className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" value={hint.penalty} onChange={e => setForm(f => ({...f, hints: f.hints.map((h,idx) => idx===i ? {...h, penalty: +e.target.value} : h)}))} className="w-16 border rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {form.hints.length > 1 && <button type="button" onClick={() => setForm(f => ({...f, hints: f.hints.filter((_,idx) => idx!==i)}))} className="text-red-400">✕</button>}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(c => (
            <div key={c._id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-bold text-blue-600">{c.category}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${DIFF_COLORS[c.difficulty]}`}>{c.difficulty}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{c.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>
              <div className="flex justify-between text-xs text-gray-400">
                <span>🏆 {c.points} pts</span>
                <span>✓ {c.solves?.length || 0} solves</span>
                <span>💡 {c.hints?.length || 0} hints</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}