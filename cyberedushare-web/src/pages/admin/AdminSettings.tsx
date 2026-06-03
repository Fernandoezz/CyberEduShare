import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    emailNotifications:  user?.notificationPreferences?.emailNotifications ?? true,
    pushNotifications:   user?.notificationPreferences?.pushNotifications ?? true,
    systemAlerts:        user?.notificationPreferences?.labAlerts ?? true,
    adminActivityAlerts: true,
    criticalSecurity:    false,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/notification-preferences', {
        emailNotifications: prefs.emailNotifications,
        pushNotifications:  prefs.pushNotifications,
        labAlerts:          prefs.systemAlerts,
      });
      alert('Preferences saved.');
    } catch { alert('Failed to save.'); }
    setSaving(false);
  };

  const handleDeleteAccount = () => {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    api.delete('/users/me')
      .then(() => { logout(); navigate('/login'); })
      .catch(() => alert('Failed.'));
  };

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-base font-semibold text-gray-700 mb-6">Profile & Settings</h2>

      <div className="flex gap-8 flex-wrap">
        {/* Left */}
        <div className="flex-1 min-w-[240px]">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-800">Name: {user?.username}</p>
            <p className="text-xs text-gray-500">Role: System Administrator</p>
            <p className="text-xs text-gray-500">Email: {user?.email}</p>
          </div>

          {/* Notification Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { key: 'emailNotifications',  label: 'Email Notifications' },
                { key: 'pushNotifications',   label: 'Push Notifications' },
                { key: 'systemAlerts',        label: 'System Alerts (Errors/Warnings)' },
                { key: 'adminActivityAlerts', label: 'Admin Activity Alerts' },
                { key: 'criticalSecurity',    label: 'Critical Security Alerts' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <button
                    onClick={() => toggle(key as keyof typeof prefs)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      prefs[key as keyof typeof prefs] ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        prefs[key as keyof typeof prefs] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Right — Sections */}
        <div className="flex-1 min-w-[220px] space-y-4">
          {/* System Access */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Sections
            </h3>
            <p className="text-sm text-gray-700 font-medium mb-1">System Access Overview</p>
            <p className="text-xs text-gray-500">Admin Level: Full Access</p>
          </div>

          {/* Linked Accounts */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Linked Accounts
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>SSO: Connected</p>
              <p>Admin Console Access: Enabled</p>
              <p>Google Drive: Not Connected</p>
            </div>
          </div>

          {/* Security & Data Controls */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Security & Data Controls
            </h3>
            <div className="space-y-1 text-xs text-indigo-600">
              <button onClick={() => navigate('/admin/logs')} className="block hover:underline text-left">
                View audit logs →
              </button>
              <button className="block hover:underline text-left">
                Manage system permissions →
              </button>
              <button className="block hover:underline text-left">
                Configure backup settings →
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
