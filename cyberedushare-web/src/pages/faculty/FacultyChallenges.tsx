import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';

type UploadFile = { name: string; progress: number };

export default function FacultyChallenges() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    difficulty: 'Easy',
    points: 50,
    description: '',
    flag: '',
  });
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchChallenges = async () => {
    setLoading(true);
    try { const res = await api.get('/challenges'); setChallenges(res.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchChallenges(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected.map(f => ({ name: f.name, progress: Math.floor(Math.random() * 60) + 40 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/challenges/create', form);
      setShowForm(false);
      fetchChallenges();
    } catch { alert('Failed'); }
    setSaving(false);
  };

  // Show create form as a full page (matching wireframe)
  if (showForm) {
    return (
      <div className="p-8 max-w-2xl">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Create Challenge</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty:</label>
            <div className="relative inline-block">
              <select
                value={form.difficulty}
                onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                className="appearance-none border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer"
              >
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points:</label>
            <input
              type="number"
              value={form.points}
              onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
              className="w-32 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none"
            />
          </div>

          {/* Flag format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flag format:</label>
            <input
              value={form.flag}
              onChange={e => setForm(f => ({ ...f, flag: e.target.value }))}
              placeholder="FLAG{...}"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse
              </button>
              <button type="button" className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Upload
              </button>
            </div>
            <input ref={fileRef} type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.zip,.mp4,.jpg,.jpeg,.png" />
            <p className="text-xs text-gray-400 mb-2">Tap to choose file (PDF / ZIP / Video / Image)</p>
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-gray-600 w-28 truncate">{f.name}</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${f.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Publishing...' : 'Publish Challenge'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">CTF Challenges</h1>
          <p className="text-sm text-gray-400">{challenges.length} challenges</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors"
        >
          + Create Challenge
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((c: any) => (
            <div key={c._id} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-indigo-600">{c.category}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.difficulty}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">{c.title}</h3>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>🏆 {c.points} pts</span>
                <span>✓ {c.solves?.length || 0} solves</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}