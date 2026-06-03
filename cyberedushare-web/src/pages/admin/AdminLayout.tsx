import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

const navItems = [
  {
    to: '/admin/dashboard',
    label: 'Home',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/admin/logs',
    label: 'Logs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    to: '/admin/integrations',
    label: 'Integrations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
        <path d="M13 6h3a2 2 0 0 1 2 2v7"/>
        <line x1="6" y1="9" x2="6" y2="21"/>
      </svg>
    ),
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-[110px] bg-white border-r border-gray-100 flex flex-col items-center py-4 shadow-sm z-10">
        <div className="mb-6 px-2 text-center">
          <span className="text-[11px] font-bold text-gray-800 leading-tight">CyberEduShare</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 w-full px-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-[10px] font-medium transition-all duration-150 relative
                ${isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-indigo-600 rounded-r-full" />
                  )}
                  <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-3 px-2 w-full">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex flex-col items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-4 px-6 flex-shrink-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.username?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.username ?? 'Admin'}</span>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 flex items-center bg-indigo-600 rounded-full px-4 py-1.5 gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-indigo-300 text-sm flex-1 outline-none"
              />
            </div>
            <button className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">
              All
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}