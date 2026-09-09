import { Link } from 'react-router-dom';
import Logo from '../layout/Logo.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { isProjectMember } from '../../mocks/project.js';

const TABS = [
  { key: 'overview', label: 'Overview', path: 'overview' },
  { key: 'tasks', label: 'Manage Tasks', path: 'tasks' },
  { key: 'chat', label: 'Chat', path: 'chat' },
];

export default function ProjectWorkspaceHeader({ projectId, projectName, active }) {
  const { user } = useAuth();
  const name = user?.full_name || 'Guest';

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <Logo />
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

      <div className="flex items-center gap-6 border-t border-neutral-100 bg-neutral-50 px-6 py-3 text-sm">
        <div className="flex items-center gap-2 mr-2">
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
          <span className="font-semibold text-neutral-900 max-w-[200px] truncate">{projectName || 'Project Workspace'}</span>
        </div>

        <nav className="flex items-center gap-6">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <Link
                key={tab.key}
                to={`/projects/${projectId}/${tab.path}`}
                className={
                  isActive
                    ? 'border-b-2 border-neutral-900 pb-3 -mb-3 font-semibold text-neutral-900'
                    : 'font-medium text-neutral-500 hover:text-neutral-900'
                }
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
