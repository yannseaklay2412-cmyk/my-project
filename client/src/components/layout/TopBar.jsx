import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const name = user?.full_name || 'Guest';

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-8">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 sm:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>

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

        <div className="flex items-center gap-3 sm:gap-4">
          <NotificationDropdown />
          {user ? (
            <Link to={`/u/${user.id}`} className="flex items-center gap-2">
              <Avatar name={name} size="sm" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-100 bg-white px-4 py-3 sm:hidden animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {TOP_NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    isActive ? 'bg-lime-400 font-semibold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <div className="my-2 border-t border-neutral-100" />
                <Link
                  to={`/u/${user.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 hover:bg-neutral-100"
                >
                  <Avatar name={name} size="xs" />
                  <span>Your profile</span>
                </Link>
                <Link
                  to="/projects/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 font-medium text-neutral-900 hover:bg-neutral-100"
                >
                  + Create project
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-neutral-100" />
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-neutral-900 hover:bg-neutral-100"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-neutral-900 px-3 py-2 text-center text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
