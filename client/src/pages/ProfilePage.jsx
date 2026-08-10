import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import TagChip from '../components/ui/TagChip.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Placeholder until real project-membership data exists on the backend.
const MOCK_COLLABORATIONS = 7;

function formatMemberSince(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const PROJECTS = [
  {
    id: 1,
    title: 'Nexus Research Portal',
    description: 'A centralized dashboard for academic researchers to track publication status and collaborate.',
    status: 'Active',
    role: 'Owner',
    tags: ['React', 'Firebase'],
  },
  {
    id: 2,
    title: 'Distributed Ledger UI',
    description: 'UI design and frontend implementation for a peer-to-peer asset management system.',
    status: 'Completed',
    role: 'Member',
    tags: ['Vue.js', 'PostgreSQL'],
  },
  {
    id: 3,
    title: 'Eco-Sensing API',
    description: 'High-performance REST API built to handle real-time environmental sensor data streams.',
    status: 'Active',
    role: 'Owner',
    tags: ['Node.js', 'Redis'],
  },
  {
    id: 4,
    title: 'HCI Toolkit',
    description: 'Open-source library of UI components optimized for academic publication interfaces.',
    status: 'Active',
    role: 'Member',
    tags: ['Tailwind', 'TypeScript'],
  },
];

const STATUS_STYLES = {
  Active: 'bg-lime-400 text-neutral-900',
  Completed: 'bg-neutral-200 text-neutral-600',
};

const ROLE_STYLES = {
  Owner: 'bg-lime-400 text-neutral-900',
  Member: 'bg-neutral-200 text-neutral-600',
};

function MiniBadge({ label, styles }) {
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const name = user?.username || 'Guest';
  const skills = user?.skills || [];

  return (
    <DashboardLayout active="dashboard">
      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-5">
          <Avatar name={name} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{name}</h1>
            <p className="text-sm text-neutral-500">
              {[user?.university, user?.year, user?.major].filter(Boolean).join(' · ') ||
                'Add your university, year, and major'}
            </p>
            {user?.github_url && (
              <a
                href={user.github_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm font-medium text-lime-600 hover:text-lime-700"
              >
                {'</>'} GitHub Profile
              </a>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.length > 0 ? (
                skills.map((skill) => <TagChip key={skill}>{skill}</TagChip>)
              ) : (
                <p className="text-xs text-neutral-400">No skills added yet</p>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/profile/edit"
          className="h-fit rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Edit profile
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold text-neutral-900">About</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
            {user?.bio || 'No bio yet — add one from Edit profile.'}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-semibold text-neutral-900">Stats</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">Projects</dt>
              <dd className="font-semibold text-neutral-900">{PROJECTS.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">Collaborations</dt>
              <dd className="font-semibold text-neutral-900">{MOCK_COLLABORATIONS}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">Member since</dt>
              <dd className="font-semibold text-neutral-900">{formatMemberSince(user?.created_at)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Projects ({PROJECTS.length})</h2>
        <Link to="/projects" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          View all →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <div key={project.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <MiniBadge label={project.status} styles={STATUS_STYLES[project.status]} />
              <MiniBadge label={project.role} styles={ROLE_STYLES[project.role]} />
            </div>
            <h3 className="mt-3 font-semibold text-neutral-900">{project.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <TagChip key={tag}>{tag}</TagChip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
