import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function FacultyLabs() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: 'Medium',
    duration: 60,
    vmUrl: '',
    vmUsername: '',
    vmPassword: '',
    instructions: [''],
  });
  const [saving, setSaving] = useState(false);

  const fetchLabs = async () => {
    setLoading(true);
    try { const res = await api.get('/labs'); setLabs(res.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchLabs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/labs/create', { ...form, instructions: form.instructions.filter(i => i.trim()) });
      setShowForm(false);
      fetchLabs();
    } catch { alert('Failed'); }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Virtual Labs</h1>
          <p className="text-sm text-gray-400">{labs.length} labs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors"
        >
          + Create Lab
        </button>
      </div>

      {/* Create Lab Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between mb-5">
              <h2 className="text-base font-bold text-gray-800">Create Lab</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">VM URL</label>
                <input value={form.vmUrl} onChange={e => setForm(f => ({ ...f, vmUrl: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">VM Username</label>
                  <input value={form.vmUsername} onChange={e => setForm(f => ({ ...f, vmUsername: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">VM Password</label>
                  <input type="password" value={form.vmPassword} onChange={e => setForm(f => ({ ...f, vmPassword: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gray-600">Instructions</label>
                  <button type="button" onClick={() => setForm(f => ({ ...f, instructions: [...f.instructions, ''] }))} className="text-indigo-600 text-xs hover:underline">+ Add Step</button>
                </div>
                {form.instructions.map((ins, i) => (
                  <div key={i} className="flex gap-2 mb-1.5">
                    <input
                      value={ins}
                      onChange={e => setForm(f => ({ ...f, instructions: f.instructions.map((x, idx) => idx === i ? e.target.value : x) }))}
                      placeholder={`Step ${i + 1}`}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-full text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-full text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab: any) => (
            <div key={lab._id} className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{lab.title}</h3>
              <p className="text-xs text-indigo-600 mb-3">{lab.subject}</p>
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