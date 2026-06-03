import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Lab } from '../../types';

const EMPTY_LAB = {
  title: '', description: '', subject: '', difficulty: 'Medium' as const,
  duration: 60, vmUrl: '', vmUsername: '', vmPassword: '', instructions: [''],
};

export default function AdminLabs() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_LAB);
  const [saving, setSaving] = useState(false);

  const fetchLabs = async () => {
    setLoading(true);
    try { const res = await api.get('/labs'); setLabs(res.data); } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { fetchLabs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/labs/create', { ...form, instructions: form.instructions.filter(i => i.trim()) });
      setShowForm(false); setForm(EMPTY_LAB); fetchLabs();
    } catch (e) { alert('Failed to create lab'); }
    setSaving(false);
  };

  const diffColor = (d: string) => d === 'Easy' ? 'bg-green-100 text-green-700' : d === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Virtual Labs</h1>
          <p className="text-gray-500 text-sm">{labs.length} labs available</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Create Lab
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-bold">Create New Lab</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value as any}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(f => ({...f, duration: +e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VM URL</label>
                <input value={form.vmUrl} onChange={e => setForm(f => ({...f, vmUrl: e.target.value}))} placeholder="http://192.168.x.x:6080/vnc.html?autoconnect=1" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VM Username</label>
                  <input value={form.vmUsername} onChange={e => setForm(f => ({...f, vmUsername: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VM Password</label>
                  <input value={form.vmPassword} onChange={e => setForm(f => ({...f, vmPassword: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Instructions</label>
                  <button type="button" onClick={() => setForm(f => ({...f, instructions: [...f.instructions, '']}))} className="text-blue-600 text-xs">+ Add step</button>
                </div>
                {form.instructions.map((ins, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center flex-shrink-0 mt-1.5">{i+1}</div>
                    <input value={ins} onChange={e => setForm(f => ({...f, instructions: f.instructions.map((x, idx) => idx===i ? e.target.value : x)}))} placeholder={`Step ${i+1}...`} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {form.instructions.length > 1 && <button type="button" onClick={() => setForm(f => ({...f, instructions: f.instructions.filter((_,idx) => idx!==i)}))} className="text-red-400 mt-1.5">✕</button>}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-60">{saving ? 'Creating...' : 'Create Lab'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-10 text-gray-400">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map(lab => (
            <div key={lab._id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between mb-3">
                <span className="text-2xl">🔬</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${diffColor(lab.difficulty)}`}>{lab.difficulty}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{lab.title}</h3>
              <p className="text-xs text-blue-600 mb-2">{lab.subject}</p>
              {lab.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{lab.description}</p>}
              <div className="flex justify-between text-xs text-gray-400">
                <span>⏱ {lab.duration} min</span>
                <span>✓ {lab.completions?.length || 0} completions</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}