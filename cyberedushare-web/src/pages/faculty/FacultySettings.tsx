import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type Toggle = {
  label: string;
  key: 'email' | 'push' | 'moderation' | 'student';
};

const toggleItems: Toggle[] = [
  { label: 'Email Notifications',      key: 'email' },
  { label: 'Push Notifications',       key: 'push' },
  { label: 'Content Moderation Alerts',key: 'moderation' },
  { label: 'Student Activity Alerts',  key: 'student' },
];

export default function FacultySettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    email: true,
    push: true,
    moderation: true,
    student: false,
  });

  const toggle = (key: Toggle['key']) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-800 mb-8">Profile &amp; Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Profile + Notifications */}
        <div className="flex-1 space-y-8">
          {/* Avatar + info */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
                👤
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-indigo-700 transition-colors">
                ✏
              </button>
            </div>
            <div className="text-center text-sm text-gray-700 space-y-0.5">
              <p>Name: {user?.username ?? 'Ali'}</p>
              <p>Role: Faculty</p>
              <p>Email: {user?.email ?? 'ali@gmail.com'}</p>
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {toggleItems.map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  {/* Toggle switch */}
                  <button
                    onClick={() => toggle(item.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      prefs[item.key] ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        prefs[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sections */}
        <div className="w-64 space-y-4">
          {/* Courses Taught */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Courses Taught</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>CS101 – Cryptography</li>
              <li>CS102 – OS</li>
              <li>CS201 – Networks</li>
            </ul>
          </div>

          {/* Linked Accounts */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Linked Accounts</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>LMS: Connected (Moodle)</li>
              <li>Google Drive: Not Connected</li>
            </ul>
          </div>

          {/* Privacy & Data */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Privacy &amp; Data</h3>
            <ul className="space-y-1 text-sm text-indigo-600">
              <li><button className="hover:underline">Export my data →</button></li>
              <li><button className="hover:underline">Manage permissions →</button></li>
              <li><button className="hover:underline">Delete history →</button></li>
            </ul>
          </div>

          {/* Auth buttons */}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
          >
            Logout
          </button>
          <button className="w-full bg-red-500 text-white text-sm font-medium py-2.5 rounded-full hover:bg-red-600 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
