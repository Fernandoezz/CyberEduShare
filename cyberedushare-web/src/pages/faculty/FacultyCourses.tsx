import { useEffect, useState } from 'react';
import api from '../../api/axios';

type Course = {
  _id: string;
  code: string;
  title: string;
  students: number;
  avgProgress: number;
  completionRate: number;
  status: 'Active' | 'Archived' | 'Draft';
};

const MOCK_COURSES: Course[] = [
  { _id: '1', code: 'CS101', title: 'Cryptography',             students: 180, avgProgress: 54, completionRate: 21, status: 'Active' },
  { _id: '2', code: 'CS102', title: 'Introduction to Cybersecurity', students: 220, avgProgress: 38, completionRate: 12, status: 'Active' },
  { _id: '3', code: 'CS201', title: 'Networks & Protocols',     students: 95,  avgProgress: 67, completionRate: 41, status: 'Active' },
];

const STATUS_STYLES: Record<Course['status'], string> = {
  Active:   'bg-green-50  text-green-700  border border-green-200',
  Draft:    'bg-amber-50  text-amber-700  border border-amber-200',
  Archived: 'bg-gray-100  text-gray-500   border border-gray-200',
};

// Helper to safely extract the courses array from any response shape
function extractCourses(data: unknown): Course[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.courses)) return d.courses as Course[];
    if (Array.isArray(d.data))    return d.data as Course[];
  }
  return [];
}

export default function FacultyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Course | null>(null);
  const [form, setForm] = useState({ code: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses/my');
      setCourses(extractCourses(res.data));
    } catch {
      setCourses(MOCK_COURSES);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadCourses();
      setLoading(false);
    };
    init();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/courses', form);
      setShowForm(false);
      setForm({ code: '', title: '', description: '' });
      await loadCourses();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || 'Failed to add course. Please try again.');
    }
    setSaving(false);
  };

  if (selected) {
    return (
      <div className="p-8 max-w-3xl">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-gray-400 hover:text-gray-700 mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-5 mb-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">{selected.code}</p>
              <h1 className="text-lg font-bold text-gray-800">{selected.title}</h1>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[selected.status]}`}>
              {selected.status}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Students',        value: selected.students },
            { label: 'Avg Progress',    value: `${selected.avgProgress}%` },
            { label: 'Completion Rate', value: `${selected.completionRate}%` },
          ].map(s => (
            <div key={s.label} className="bg-indigo-600 text-white rounded-full px-5 py-2.5 text-center">
              <p className="text-xs opacity-80">{s.label}</p>
              <p className="text-base font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Upload Resource', path: '/faculty/upload' },
              { label: 'Create Lab',      path: '/faculty/labs' },
              { label: 'Add Challenge',   path: '/faculty/challenges' },
              { label: 'View Analytics',  path: '/faculty/analytics' },
            ].map(a => (
              <a
                key={a.label}
                href={a.path}
                className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors"
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>

        {/* Knowledge gaps */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Top Knowledge Gaps</h2>
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 space-y-3">
            {[
              { topic: 'Network Security Fundamentals', pct: 71 },
              { topic: 'OS Hardening',                 pct: 63 },
              { topic: 'SQL Injection',                pct: 59 },
            ].map(g => (
              <div key={g.topic} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-52 flex-shrink-0">{g.topic}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-20 text-right">{g.pct}% struggling</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {[
              { action: 'New resource uploaded',       detail: 'SQLi Lab.pdf',           time: '2 hours ago' },
              { action: 'Student completed lab',        detail: 'Web Security Basics',    time: '5 hours ago' },
              { action: 'Challenge solved',             detail: 'XSS Hunter — 3 solves',  time: 'Yesterday' },
              { action: 'Resource flagged for review',  detail: 'Hashing Notes.pdf',      time: '2 days ago' },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">{item.action}</p>
                  <p className="text-xs text-gray-400">{item.detail}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Courses</h1>
          <p className="text-sm text-gray-400">{courses.length} courses</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(null); }}
          className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors"
        >
          + Add Course
        </button>
      </div>

      {/* Create Course Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between mb-5">
              <h2 className="text-base font-bold text-gray-800">Add Course</h2>
              <button
                onClick={() => { setShowForm(false); setError(null); }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Course Code *</label>
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="e.g. CS301"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Course Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Advanced Network Security"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief course description..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-full text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-full text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Adding...' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course list */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-sm">No courses yet. Add your first course.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <div
              key={course._id}
              onClick={() => setSelected(course)}
              className="bg-white rounded-xl border border-gray-100 px-5 py-4 cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">{course.code}</p>
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">{course.title}</h3>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[course.status]}`}>
                  {course.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Avg progress</span>
                  <span>{course.avgProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${course.avgProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>👥 {course.students} students</span>
                <span>✓ {course.completionRate}% completed</span>
                <span className="text-indigo-500 group-hover:text-indigo-700 transition-colors">View details →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}