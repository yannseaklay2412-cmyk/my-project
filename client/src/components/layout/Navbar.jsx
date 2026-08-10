import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import PillButton from '../ui/PillButton.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Feed' },
  { to: '/resources', label: 'Resources' },
];

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-neutral-50 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-8 sm:py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
              {NAV_LINKS.map((link) => {
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

            <div className="flex items-center gap-3 sm:gap-5">
              {user ? (
                <Link to={`/u/${user.id}`}>
                  <Avatar name={user.username} size="sm" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-neutral-700 hover:text-neutral-900">
                    Log in
                  </Link>
                  <PillButton as={Link} to="/signup" variant="dark">
                    Sign up
                  </PillButton>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 sm:hidden"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mt-4 flex flex-col gap-1 border-t border-neutral-200 pt-4 text-sm font-medium sm:hidden">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 ${
                    isActive ? 'bg-lime-400 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
