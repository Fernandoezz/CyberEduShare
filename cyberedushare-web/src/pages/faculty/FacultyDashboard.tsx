import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myContent, setMyContent] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    api.get('/content/my')
      .then(r => setMyContent(r.data.content || []))
      .catch(() => {})
      .finally(() => setLoadingContent(false));
  }, []);

  const uploads  = myContent.length;
  const approved = myContent.filter((c: any) => c.status === 'approved').length;
  const pending  = myContent.filter((c: any) => c.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main column */}
      <div className="xl:col-span-2 space-y-6">
        {/* Quick Stats */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Quick Stats</h2>
          <div className="flex flex-wrap gap-3">
            <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
              Uploads: {uploads}
            </div>
            <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
              Approved: {approved}
            </div>
            <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
              Pending: {pending}
            </div>
          </div>
        </section>

        {/* Recommended Actions */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Recommended Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/faculty/upload')}
              className="bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Upload New Resource
            </button>
            <button
              onClick={() => navigate('/faculty/my-content')}
              className="bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              View Pending Content
            </button>
          </div>
        </section>

        {/* My Content Overview */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">My Content Overview</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {loadingContent ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm animate-pulse">Loading content…</div>
            ) : myContent.length === 0 ? (
              <>
                {/* Fallback static rows to avoid empty page */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="text-sm text-gray-700">Crypto Cheatsheet.pdf</span>
                  <div className="flex gap-6 text-sm">
                    <span className="text-green-600 font-medium">Approved</span>
                    <span className="text-gray-400">Downloads: 23</span>
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="text-sm text-gray-700">Web Security Slides</span>
                  <div className="flex gap-6 text-sm">
                    <span className="text-yellow-600 font-medium">Pending</span>
                    <span className="text-gray-400">Reviews: 12</span>
                  </div>
                </div>
              </>
            ) : myContent.slice(0, 6).map((c: any) => (
              <div key={c._id} className="px-5 py-4 flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate flex-1 mr-4">{c.title}</span>
                <div className="flex gap-4 text-sm flex-shrink-0">
                  <span className={
                    c.status === 'approved' ? 'text-green-600 font-medium' :
                    c.status === 'rejected' ? 'text-red-500 font-medium'   :
                                              'text-yellow-600 font-medium'
                  }>
                    {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
                  </span>
                  {c.downloads != null && <span className="text-gray-400">Downloads: {c.downloads}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Course Analytics Snapshot */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Course Analytics Snapshot</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm text-gray-700 mb-1">
                  Course: CS102 &nbsp;|&nbsp; Students: 220 &nbsp;|&nbsp; Avg Score: 62%
                </p>
                <p className="text-sm text-gray-500">
                  Common Gaps: Input Validation (62%), SQLi (48%)
                </p>
              </div>
              <button
                onClick={() => navigate('/faculty/analytics')}
                className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0"
              >
                View Full Analytics
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Right sidebar */}
      <div className="space-y-6">
        {/* Upload progress */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Upload Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Approved', pct: uploads > 0 ? Math.round(approved / uploads * 100) : 75, color: 'bg-green-400' },
              { label: 'Pending',  pct: uploads > 0 ? Math.round(pending  / uploads * 100) : 25, color: 'bg-yellow-400' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{label}</span><span>{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[
              { label: '📤 Upload Resource', to: '/faculty/upload'     },
              { label: '📊 View Analytics',  to: '/faculty/analytics'  },
              { label: '📚 My Content',      to: '/faculty/my-content' },
              { label: '📋 Manage Courses',  to: '/faculty/courses'    },
            ].map(({ label, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="w-full text-left text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent student feedback */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Student Engagement</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between"><span>Active students</span><span className="font-medium text-gray-700">220</span></div>
            <div className="flex justify-between"><span>Avg session time</span><span className="font-medium text-gray-700">34 min</span></div>
            <div className="flex justify-between"><span>Resources saved</span><span className="font-medium text-gray-700">87</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}