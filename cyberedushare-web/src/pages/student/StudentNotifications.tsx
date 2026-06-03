import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data.notifications || [])).catch(()=>{}).finally(()=>setLoading(false));
    // Mark all as read when opened
    api.put('/notifications/mark-all-read').catch(()=>{});
  }, []);

  const groupByDate = (notifs: any[]) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
    const groups: Record<string, any[]> = { Today: [], Yesterday: [], Earlier: [] };
    notifs.forEach(n => {
      const d = new Date(n.createdAt); d.setHours(0,0,0,0);
      if (d.getTime() === today.getTime()) groups.Today.push(n);
      else if (d.getTime() === yesterday.getTime()) groups.Yesterday.push(n);
      else groups.Earlier.push(n);
    });
    return groups;
  };

  const timeStr = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const groups = groupByDate(notifications);

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-800 mb-6">Notifications</h1>
      {loading ? <div className="text-sm text-gray-400">Loading...</div> : (
        Object.entries(groups).filter(([,items]) => items.length > 0).map(([label, items]) => (
          <div key={label} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">{label}</h2>
            <div className="space-y-2">
              {items.map((n: any) => (
                <div key={n._id} className="border border-gray-100 rounded-lg p-4 bg-white">
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{timeStr(n.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      {!loading && notifications.length === 0 && (
        <div className="text-sm text-gray-400">No notifications yet.</div>
      )}
    </div>
  );
}