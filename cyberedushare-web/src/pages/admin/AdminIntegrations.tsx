import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface IntegrationsConfig {
  lms: {
    moodle: { connected: boolean; url?: string };
    blackboard: { connected: boolean; url?: string };
  };
  sso: {
    azureAD: { enabled: boolean };
    googleSSO: { enabled: boolean };
  };
}

export default function AdminIntegrations() {
  const [config, setConfig] = useState<IntegrationsConfig>({
    lms: {
      moodle:     { connected: false },
      blackboard: { connected: false },
    },
    sso: {
      azureAD:   { enabled: false },
      googleSSO: { enabled: false },
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/integrations')
      .then(r => {
        const d = r.data ?? {};
        setConfig({
          lms: {
            moodle:     { connected: false, ...d.lms?.moodle },
            blackboard: { connected: false, ...d.lms?.blackboard },
          },
          sso: {
            azureAD:   { enabled: false, ...d.sso?.azureAD },
            googleSSO: { enabled: false, ...d.sso?.googleSSO },
          },
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleLMS = async (provider: 'moodle' | 'blackboard') => {
    setSaving(provider);
    const current = config.lms[provider].connected;
    try {
      await api.put(`/admin/integrations/lms/${provider}`, { connected: !current });
      setConfig(c => ({
        ...c,
        lms: { ...c.lms, [provider]: { ...c.lms[provider], connected: !current } },
      }));
    } catch { alert('Failed to update.'); }
    setSaving(null);
  };

  const toggleSSO = async (provider: 'azureAD' | 'googleSSO') => {
    setSaving(provider);
    const current = config.sso[provider].enabled;
    try {
      await api.put(`/admin/integrations/sso/${provider}`, { enabled: !current });
      setConfig(c => ({
        ...c,
        sso: { ...c.sso, [provider]: { enabled: !current } },
      }));
    } catch { alert('Failed to update.'); }
    setSaving(null);
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading...</div>;

  return (
    <div className="p-8 max-w-xl">
      {/* LMS */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">LMS</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          {/* Moodle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 font-medium">Moodle</p>
              <p className="text-xs text-gray-500">
                {config.lms.moodle.connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
            {config.lms.moodle.connected ? (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                Connected
              </span>
            ) : (
              <button
                onClick={() => toggleLMS('moodle')}
                disabled={saving === 'moodle'}
                className="text-xs text-indigo-600 border border-indigo-300 px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-60"
              >
                {saving === 'moodle' ? '...' : 'Connect'}
              </button>
            )}
          </div>

          {/* Blackboard */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 font-medium">Blackboard</p>
              <p className="text-xs text-gray-500">
                {config.lms.blackboard.connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
            {config.lms.blackboard.connected ? (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                Connected
              </span>
            ) : (
              <button
                onClick={() => toggleLMS('blackboard')}
                disabled={saving === 'blackboard'}
                className="text-xs text-indigo-600 border border-indigo-300 px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-60"
              >
                {saving === 'blackboard' ? '...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SSO */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">SSO</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          {/* Azure AD */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 font-medium">Azure AD</p>
              <p className="text-xs text-gray-500">
                {config.sso.azureAD.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            {config.sso.azureAD.enabled ? (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                Enabled
              </span>
            ) : (
              <button
                onClick={() => toggleSSO('azureAD')}
                disabled={saving === 'azureAD'}
                className="text-xs text-indigo-600 border border-indigo-300 px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-60"
              >
                {saving === 'azureAD' ? '...' : 'Enable'}
              </button>
            )}
          </div>

          {/* Google SSO */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 font-medium">Google SSO</p>
              <p className="text-xs text-gray-500">
                {config.sso.googleSSO.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            {config.sso.googleSSO.enabled ? (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                Enabled
              </span>
            ) : (
              <button
                onClick={() => toggleSSO('googleSSO')}
                disabled={saving === 'googleSSO'}
                className="text-xs text-indigo-600 border border-indigo-300 px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-60"
              >
                {saving === 'googleSSO' ? '...' : 'Enable'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}