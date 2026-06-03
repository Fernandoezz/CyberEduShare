import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

export default function StudentSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ emailNotifications: true, pushNotifications: true, labAlerts: false, newResourceAlerts: true });
  const [courses, setCourses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPrefs(user.notificationPreferences || prefs);
      setCourses(user.enrolledCourses || []);
    }
  }, [user]);

  const togglePref = async (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key as keyof typeof prefs] };
    setPrefs(updated);
    try { await api.put('/auth/profile/notifications', updated); } catch(e){}
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    try { await api.delete('/auth/profile/delete-account'); logout(); navigate('/login'); } catch(e){}
  };

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-800 mb-6">Profile & Settings</h1>
      <div className="flex gap-8">
        {/* Left — avatar + prefs */}
        <div className="flex-1 max-w-xs">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl">👤</div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs">✎</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800 mt-3">Name: {user?.username}</p>
            <p className="text-xs text-gray-500">Role: {user?.role}</p>
            <p className="text-xs text-gray-500">Email: {user?.email}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Notification Preferences</p>
            <div className="space-y-3">
              {[
                { key: 'emailNotifications', label: 'Email Notifications' },
                { key: 'pushNotifications',  label: 'Push Notifications' },
                { key: 'labAlerts',          label: 'Lab Alerts' },
                { key: 'newResourceAlerts',  label: 'New Resource Alerts' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <button
                    onClick={() => togglePref(item.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${prefs[item.key as keyof typeof prefs] ? 'bg-indigo-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[item.key as keyof typeof prefs] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — sections */}
        <div className="flex-1 space-y-4">
          <div className="border border-gray-100 rounded-lg p-4 bg-white">
            <p className="text-xs font-semibold text-gray-500 mb-2">Enrolled Courses</p>
            {courses.length === 0 ? (
              <p className="text-xs text-gray-400">No courses enrolled.</p>
            ) : courses.map(c => <p key={c} className="text-sm text-gray-700">{c}</p>)}
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-white">
            <p className="text-xs font-semibold text-gray-500 mb-2">Linked Accounts</p>
            <p className="text-sm text-gray-700">LMS: Connected (Moodle)</p>
            <p className="text-sm text-gray-400">Google Drive: Not Connected</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-white">
            <p className="text-xs font-semibold text-gray-500 mb-2">Privacy & Data</p>
            <p className="text-sm text-indigo-500 cursor-pointer hover:underline">Export my data →</p>
            <p className="text-sm text-indigo-500 cursor-pointer hover:underline mt-1">Manage permissions →</p>
            <p className="text-sm text-indigo-500 cursor-pointer hover:underline mt-1">Delete history →</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { logout(); navigate('/login'); }}
              className="bg-indigo-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-indigo-600">Logout</button>
            <button onClick={handleDeleteAccount}
              className="bg-red-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-red-600">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}