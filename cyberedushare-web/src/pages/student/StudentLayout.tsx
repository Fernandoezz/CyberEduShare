import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

const navItems = [
  { to: '/student/home',         label: 'Home',               icon: '⊞' },
  { to: '/student/upload',       label: 'Upload Resource',    icon: '↑' },
  { to: '/student/qa',           label: 'Q&A',                icon: '?' },
  { to: '/student/projects',     label: 'Projects Repository',icon: '✦' },
  { to: '/student/labs',         label: 'Labs',               icon: '⚗' },
  { to: '/student/challenges',   label: 'Challenges',         icon: '◎' },
  { to: '/student/performance',  label: 'Performance',        icon: '📈' },
  { to: '/student/notifications',label: 'Notifications',      icon: '🔔' },
  { to: '/student/settings',     label: 'Settings',           icon: '⚙' },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(r => setUnread(r.data.unreadCount || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar — increased from w-36 to w-52 */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-indigo-600 font-bold text-sm">CyberEduShare</span>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors relative ${
                  isActive ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 rounded-r" />}
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.label === 'Notifications' && unread > 0 && (
                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <span>⎋</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.username}</span>
          </div>
          <div className="flex-1 max-w-lg">
            <div className="flex items-center bg-indigo-500 rounded-full px-4 py-2 gap-2">
              <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && search.trim()) navigate(`/student/search?q=${search}`); }}
                placeholder="Search notes, labs, challenges..."
                className="flex-1 bg-transparent text-white placeholder-indigo-200 text-sm focus:outline-none"
              />
              <button className="text-white text-xs bg-indigo-600 px-2 py-0.5 rounded-full flex-shrink-0">All ▾</button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}