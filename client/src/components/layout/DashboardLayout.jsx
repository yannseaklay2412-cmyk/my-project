import { Link, useNavigate } from 'react-router-dom';
import TopBar from './TopBar.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

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
  const navigate = useNavigate();
  const name = user?.username || 'Guest';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />

      <div className="flex">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white p-5 sm:flex">
          <div className="flex items-center gap-3">
            <Avatar name={name} size="md" />
            <div>
              <p className="text-sm font-semibold text-neutral-900">{name}</p>
              <p className="text-xs text-neutral-400">{user?.major || 'CollabHub member'}</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1 text-sm font-medium">
            {SIDEBAR_LINKS.map((link) => {
              const isActive = active === link.key;
              return (
                <Link
                  key={link.key}
                  to={link.to(user?.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    isActive
                      ? 'bg-lime-400 font-semibold text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 text-sm font-medium text-neutral-600">
            <Link to="/resources" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-100">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Help
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-neutral-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
