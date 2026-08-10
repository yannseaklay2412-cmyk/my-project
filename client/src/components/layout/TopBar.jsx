import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const TOP_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Feed' },
  { to: '/resources', label: 'Resources' },
];

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const name = user?.username || 'Guest';

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            {TOP_NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`border-b-2 pb-1 transition-colors ${
                    isActive
                      ? 'border-lime-400 text-neutral-900'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          {user && (
            <Link to={`/u/${user.id}`}>
              <Avatar name={name} size="sm" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
