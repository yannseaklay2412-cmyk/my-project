import { Link } from 'react-router-dom';
import Logo from '../layout/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import NotificationDropdown from '../layout/NotificationDropdown.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const TABS = [
  { key: 'overview', label: 'Overview', path: 'overview' },
  { key: 'tasks', label: 'Manage Tasks', path: 'tasks' },
  { key: 'chat', label: 'Chat', path: 'chat' },
];

export default function ProjectWorkspaceHeader({ projectId, projectName, active }) {
  const { user } = useAuth();
  const name = user?.full_name || 'Guest';

  return (
    <div className="border-b border-neutral-200 bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3 sm:gap-4">
          <NotificationDropdown />
          {user && (
            <Link to={`/u/${user.id}`}>
              <Avatar name={name} size="sm" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 border-t border-neutral-100 bg-neutral-50 px-4 py-2.5 sm:px-6 sm:py-3 text-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/projects"
            className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Feed
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="font-semibold text-neutral-900 max-w-[120px] sm:max-w-[240px] truncate">
            {projectName || 'Workspace'}
          </span>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6 shrink-0 ml-auto sm:ml-0">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <Link
                key={tab.key}
                to={`/projects/${projectId}/${tab.path}`}
                className={`text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-b-2 border-neutral-900 pb-2.5 -mb-2.5 sm:pb-3 sm:-mb-3 font-semibold text-neutral-900'
                    : 'font-medium text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
