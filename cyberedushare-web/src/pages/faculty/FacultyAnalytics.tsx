import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function FacultyAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  const contentEffectiveness = [
    { resource: 'SQLi Lab.pdf', improvement: '+26%', views: 420 },
    { resource: 'Hashing Slides', improvement: '+18%', views: 200 },
    { resource: 'Network Security Basics', improvement: '+12%', views: 310 },
  ];

  return (
    <div className="p-8 max-w-3xl space-y-8">

      {/* Course Overview */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Course Overview</h2>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 text-sm text-gray-600 space-y-1">
          <p>Course: CS102 — Introduction to Cybersecurity</p>
          <p>Students enrolled: 210 &nbsp;&nbsp; Active this week: 152</p>
          <p>Avg course progress: 42% &nbsp;&nbsp; Completion rate: 19%</p>
        </div>
      </section>

      {/* Knowledge Gap Breakdown */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Knowledge Gap Breakdown</h2>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-sm text-gray-600 mb-3">Top gaps in this course:</p>
          <ol className="space-y-1 text-sm text-gray-700">
            <li>1. Network Security Fundamentals — 71% struggling</li>
            <li>2. OS Hardening — 63% struggling</li>
            <li>3. SQL Injection — 59% struggling</li>
          </ol>
        </div>
      </section>

      {/* Content Effectiveness */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Content Effectiveness</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Improvement</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contentEffectiveness.map(row => (
                <tr key={row.resource}>
                  <td className="px-5 py-3 text-gray-700">{row.resource}</td>
                  <td className="px-5 py-3 text-green-600 font-medium">{row.improvement}</td>
                  <td className="px-5 py-3 text-gray-500">{row.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Student Progress Distribution */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Student Progress Distribution</h2>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-6">
          <p className="text-xs text-gray-400 mb-4 text-center">Pie chart / bar:</p>
          <div className="flex rounded-full overflow-hidden h-6 mb-3">
            <div className="bg-indigo-400 flex items-center justify-center text-white text-xs font-medium" style={{ width: '32%' }}>32%</div>
            <div className="bg-indigo-600 flex items-center justify-center text-white text-xs font-medium" style={{ width: '50%' }}>50%</div>
            <div className="bg-indigo-800 flex items-center justify-center text-white text-xs font-medium" style={{ width: '18%' }}>18%</div>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />Beginner: 32%</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />Intermediate: 50%</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-800 inline-block" />Advanced: 18%</span>
          </div>
        </div>
      </section>

      {/* Engagement Metrics */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Engagement Metrics</h2>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 text-sm text-gray-600 space-y-1">
          <p>Total downloads: 1,240</p>
          <p>Avg rating across resources: 4.3 / 5</p>
          <p>Most saved item: "Web Security Slides"</p>
          <p>Most viewed: "Cryptography Basics"</p>
        </div>
      </section>
    </div>
  );
}