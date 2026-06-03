import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

function useTodayTime() {
  const [seconds, setSeconds] = useState(() => {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('sessionTime') || '{}');
    return saved.date === today ? (saved.seconds || 0) : 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        const next = prev + 1;
        if (next % 10 === 0) {
          localStorage.setItem('sessionTime', JSON.stringify({
            date:    new Date().toDateString(),
            seconds: next,
          }));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

/**
 * Open a Cloudinary URL in the browser for inline viewing.
 *
 * Problem: Cloudinary's /raw/upload/ resource type does NOT support
 * transformation flags like fl_inline — the server returns 400.
 *
 * Solution by file type:
 *  - PDF  → Google Docs Viewer (works for any public URL, no CORS issues)
 *  - Image/video → open the Cloudinary URL directly (renders fine)
 */
function openForViewing(url: string): void {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Force-download a Cloudinary URL.
 * fl_attachment works on image/video; for raw we just link directly
 * (browser will download it since it can't render raw files inline).
 */
function makeDownloadUrl(url: string): string {
  return url;
}

export default function StudentHome() {
  const { user } = useAuth();
  const timeStr  = useTodayTime();

  const [recs, setRecs]           = useState<any[]>([]);
  const [activity, setActivity]   = useState<any[]>([]);
  const [completed, setCompleted] = useState(0);
  const [savedIds, setSavedIds]   = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/recommendations')
      .then(r => setRecs(r.data.recommendations || []))
      .catch(() => {});

    api.get('/notifications')
      .then(r => setActivity((r.data.notifications || []).slice(0, 10)))
      .catch(() => {});

    api.get('/performance')
      .then(r => {
        const s = r.data.stats || {};
        setCompleted((s.labsCompleted || 0) + (s.challengesSolved || 0));
      })
      .catch(() => {});

    api.get('/content/bookmarks')
      .then(r => {
        const ids = new Set<string>((r.data || []).map((b: any) => String(b._id || b.id)));
        setSavedIds(ids);
      })
      .catch(() => {});
  }, []);

  const handleStart = async (rec: any) => {
    const id = String(rec.id || rec._id);
    setLoadingId(`start-${id}`);
    try {
      const res = await api.get(`/content/${id}/view`);
      const rawUrl = res.data.url;
      if (!rawUrl) { alert('File URL not available.'); return; }
      openForViewing(rawUrl, res.data.title || 'resource');
    } catch {
      alert('Could not open the file. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleSave = async (rec: any) => {
  const id = String(rec.id || rec._id);
  setLoadingId(`save-${id}`);
  try {
    const res = await api.get(`/content/${id}/download`);
    const downloadUrl = res.data.url;
    const name = res.data.title || 'resource';

    if (!downloadUrl) {
      alert('Download not available.');
      return;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setSavedIds(prev => new Set([...prev, id]));
  } catch {
    alert('Could not download the file. Please try again.');
  } finally {
    setLoadingId(null);
  }
};
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      {/* Quick Stats */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h2>
        <div className="flex gap-3 flex-wrap">
          <div className="bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium">
            Courses: {user?.enrolledCourses?.length || 0}
          </div>
          <div className="bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium">
            Time today: {timeStr}
          </div>
          <div className="bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium">
            Completed: {completed}
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recommended for You</h2>
        {recs.length === 0 ? (
          <div className="border border-gray-100 rounded-lg p-4 text-sm text-gray-400">
            Enroll in courses in Settings to get personalized recommendations.
          </div>
        ) : (
          <div className="space-y-3">
            {recs.map((r: any) => {
              const id       = String(r.id || r._id);
              const isSaved  = savedIds.has(id);
              const starting = loadingId === `start-${id}`;
              const saving   = loadingId === `save-${id}`;

              return (
                <div key={id} className="border border-gray-100 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded flex-shrink-0">
                      {r.type || 'PDF'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {r.subject} | {r.difficulty} | {r.type}
                    {r.score !== undefined && (
                      <> | <span className="text-indigo-400">{Math.round(r.score * 100)}% confidence</span></>
                    )}
                  </p>

                  <div className="flex gap-2 mt-3 justify-end">
                    <button
                      onClick={() => handleStart(r)}
                      disabled={starting || saving}
                      className="bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-600 disabled:opacity-60 transition-colors"
                    >
                      {starting ? 'Opening...' : 'Start'}
                    </button>

                    <button
                      onClick={() => handleSave(r)}
                      disabled={starting || saving}
                      className={`text-xs px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${
                        isSaved
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600'
                      }`}
                    >
                      {saving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save'}
                    </button>

                    <button
                      onClick={() => setRecs(prev => prev.filter(x => String(x.id || x._id) !== id))}
                      className="bg-indigo-100 text-indigo-600 text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      Not relevant
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {activity.length === 0 ? (
            <div className="border border-gray-100 rounded-lg p-4 text-sm text-gray-400">
              No recent activity.
            </div>
          ) : activity.map((a: any) => (
            <div key={a._id} className="border border-gray-100 rounded-lg px-4 py-3 bg-white flex justify-between items-center">
              <span className="text-sm text-gray-700">{a.title}</span>
              <span className="text-xs text-gray-400">{formatTime(a.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}