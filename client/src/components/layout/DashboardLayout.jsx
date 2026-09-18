import { Link, useNavigate } from 'react-router-dom';
import TopBar from './TopBar.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';

const SIDEBAR_LINKS = [
  {
    key: 'dashboard',
    to: (userId) => `/u/${userId}`,
    label: 'Dashboard',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'projects',
    to: () => '/projects',
    label: 'Projects',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      </svg>
    ),
  },
  {
    key: 'favorites',
    to: () => '/favorites',
    label: 'Favorites',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: 'publications',
    to: () => '/publications',
    label: 'Publications',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ active, children }) {
  const { user, logout } = useAuth();
  const { count } = useFavorites();
  const navigate = useNavigate();
  const name = user?.full_name || 'Guest';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mobileLinks = [
    {
      key: 'projects',
      to: '/projects',
      label: 'Feed',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
      ),
    },
    {
      key: 'favorites',
      to: '/favorites',
      label: 'Saved',
      badge: user ? count : 0,
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      key: 'resources',
      to: '/resources',
      label: 'Resources',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      key: 'dashboard',
      to: user ? `/u/${user.id}` : '/login',
      label: user ? 'Profile' : 'Sign in',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <TopBar />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white p-5 sm:flex">
          <div className="flex items-center gap-3">
            <Avatar name={name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{name}</p>
              <p className="text-xs text-neutral-400 truncate">{user?.major || 'CollabHub member'}</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1 text-sm font-medium">
            {SIDEBAR_LINKS.map((link) => {
              const isActive = active === link.key;
              const badgeCount = link.key === 'favorites' ? (user ? count : 0) : 0;
              return (
                <Link
                  key={link.key}
                  to={link.to(user?.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? 'bg-lime-400 font-semibold text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {badgeCount > 0 && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 text-sm font-medium text-neutral-600 pt-6 border-t border-neutral-100">
            <Link to="/resources" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-100">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Help
            </Link>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                Logout
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 py-5 sm:px-10 sm:py-8 pb-24 sm:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-md px-3 py-1.5 sm:hidden shadow-lg"
      >
        <div className="flex items-center justify-around">
          {mobileLinks.map((link) => {
            const isActive = active === link.key;
            return (
              <Link
                key={link.key}
                to={link.to}
                className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <div className="relative">
                  {link.icon}
                  {link.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-500 px-1 text-[9px] font-bold text-neutral-900 shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-lime-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
