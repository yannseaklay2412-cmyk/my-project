import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const TOP_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Feed' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/resources', label: 'Resources' },
];

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const name = user?.full_name || 'Guest';

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
          <NotificationDropdown />
          {user ? (
            <Link to={`/u/${user.id}`}>
              <Avatar name={name} size="sm" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
