import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function StudentPerformance() {
  const [stats, setStats] = useState<any>(null);
  const [path, setPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/performance'), api.get('/performance/learning-path')])
      .then(([r1,r2]) => { setStats(r1.data); setPath(r2.data.learningPath || []); })
      .catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-400">Loading...</div>;

  const s = stats?.stats;
  const totalTopics = (stats?.enrolledCourses?.length || 0) * 4;
  const completedTopics = path.reduce((acc: number, step: any) => acc + (step.completedCount || 0), 0);
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-800 mb-6">Performance & Learning Path</h1>

      {/* Progress Overview */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Progress Overview</h2>
        <div className="border border-gray-100 rounded-lg p-5 bg-white">
          <div className="flex items-center gap-6">
            {/* Donut chart (CSS) */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${overallProgress} ${100-overallProgress}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{overallProgress}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Overall Progress: {overallProgress}%</p>
              <p className="text-xs text-gray-400 mt-1">Topics Completed: {completedTopics} / {totalTopics}</p>
              {s && (
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>🔬 {s.labsCompleted} labs</span>
                  <span>🚩 {s.challengesSolved} challenges</span>
                  <span>🏆 {s.ctfScore} pts</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weak Topics / Learning Path */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Weak Topics</h2>
        <div className="space-y-3">
          {path.length === 0 ? (
            <div className="border border-gray-100 rounded-lg p-4 text-sm text-gray-400">
              Enroll in courses in Settings to see your learning path.
            </div>
          ) : path.map((step: any) => (
            <div key={step.step} className="border border-gray-100 rounded-lg p-4 bg-white flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{step.course} ({step.completedCount}/{step.tasks?.length} done)</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {step.tasks?.filter((t:any) => !t.completed).map((t:any) => t.label).join(', ') || 'All complete!'}
                </p>
                {step.tasks?.filter((t:any) => !t.completed)?.[0] && (
                  <p className="text-xs text-indigo-500 mt-0.5">
                    Recommended: "{step.tasks.filter((t:any) => !t.completed)[0].description}"
                  </p>
                )}
              </div>
              <button onClick={() => {}} className="bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-600 flex-shrink-0 ml-3">
                View Resource
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}