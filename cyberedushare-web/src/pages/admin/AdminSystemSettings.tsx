import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface SystemSettings {
  jwtTTL: string;
  bcryptRounds: number;
  maxUploadSizeMB: number;
  allowedMimeTypes: string[];
  enableAIRecommendations: boolean;
  enableLabs: boolean;
}

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    jwtTTL: '2h',
    bcryptRounds: 12,
    maxUploadSizeMB: 50,
    allowedMimeTypes: ['pdf', 'mp4', 'pptx', 'zip'],
    enableAIRecommendations: true,
    enableLabs: true,
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then(r => setSettings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: 'enableAIRecommendations' | 'enableLabs') => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>;

  return (
    <div className="p-8 max-w-xl">
      {saved && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          Settings saved successfully.
        </div>
      )}

      {/* Authentication */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Authentication</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">JWT TTL</span>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-sm text-gray-700 mr-1">[</span>
              <input
                type="text"
                value={settings.jwtTTL}
                onChange={e => setSettings(s => ({ ...s, jwtTTL: e.target.value }))}
                className="text-sm text-gray-700 w-12 outline-none text-center"
              />
              <span className="text-sm text-gray-700">]</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">bcrypt rounds</span>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-sm text-gray-700 mr-1">[</span>
              <input
                type="number"
                value={settings.bcryptRounds}
                onChange={e => setSettings(s => ({ ...s, bcryptRounds: Number(e.target.value) }))}
                className="text-sm text-gray-700 w-10 outline-none text-center"
              />
              <span className="text-sm text-gray-700">]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Limits */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Content Limits</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Max upload size</span>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5">
              <input
                type="number"
                value={settings.maxUploadSizeMB}
                onChange={e => setSettings(s => ({ ...s, maxUploadSizeMB: Number(e.target.value) }))}
                className="text-sm text-gray-700 w-12 outline-none text-center"
              />
              <span className="text-sm text-gray-500">MB</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Allowed MIME types</span>
            <input
              type="text"
              value={settings.allowedMimeTypes.join(', ')}
              onChange={e => setSettings(s => ({
                ...s,
                allowedMimeTypes: e.target.value.split(',').map(t => t.trim()),
              }))}
              className="text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 w-48 outline-none"
            />
          </div>
        </div>
      </section>

      {/* UI / Feature Flags */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">UI / Feature Flags</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          {[
            { key: 'enableAIRecommendations' as const, label: 'Enable AI Recommendations' },
            { key: 'enableLabs' as const,              label: 'Enable Labs' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{label}</span>
              <button
                onClick={() => toggle(key)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  settings[key] ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    settings[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
