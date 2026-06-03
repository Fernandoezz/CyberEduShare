import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

const navItems = [
  { to: '/faculty/dashboard',  label: 'Home',       icon: '⊞' },
  { to: '/faculty/upload',     label: 'Upload',     icon: '⬆' },
  { to: '/faculty/my-content', label: 'My Content', icon: '☰' },
  { to: '/faculty/courses',    label: 'Courses',    icon: '✦' },
  { to: '/faculty/analytics',  label: 'Analytics',  icon: '📊' },
  { to: '/faculty/challenges', label: 'Challenges', icon: '◈' },
  { to: '/faculty/settings',   label: 'Settings',   icon: '⚙' },
];

export default function FacultyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar — increased from w-36 to w-52 */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-indigo-600 font-bold text-sm">CyberEduShare</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors relative ${
                  isActive
                    ? 'text-indigo-600 font-semibold bg-indigo-50'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 rounded-r" />}
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 px-4 py-2 w-full rounded-lg text-sm text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
          >
            <span>⬡</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center overflow-hidden">
              <span className="text-white text-sm font-bold">
                {user?.username?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.username ?? 'Ali'}</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 flex items-center bg-indigo-600 rounded-full px-4 py-2 gap-2 max-w-xl">
            <span className="text-white text-sm">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources, courses..."
              className="flex-1 bg-transparent text-white placeholder-indigo-300 text-sm outline-none"
            />
            <div className="flex items-center gap-1 text-white text-sm">
              <span>All</span>
              <span>▾</span>
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