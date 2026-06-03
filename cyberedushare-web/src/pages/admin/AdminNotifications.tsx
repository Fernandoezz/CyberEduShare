import { useState } from 'react';
import api from '../../api/axios';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSending(true); setSuccess(''); setError('');
    try {
      const res = await api.post('/admin/notifications/broadcast', { title, body });
      setSuccess(res.data.message);
      setTitle(''); setBody('');
    } catch (e: any) { setError(e.response?.data?.message || 'Failed to send'); }
    setSending(false);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-500 text-sm">Send broadcast notifications to all users</p>
      </div>
      <div className="max-w-lg">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">📢 Broadcast to All Users</h2>
          {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">{success}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..." required className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} placeholder="Optional message body..." className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={sending} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
              {sending ? 'Sending...' : '🔔 Send to All Users'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}