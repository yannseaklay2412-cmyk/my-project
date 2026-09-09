import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import TagChip from '../components/ui/TagChip.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserById } from '../services/auth.js';
import { getProjects } from '../services/projects.js';

function formatMemberSince(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

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
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const isOwnProfile = !userId || (currentUser && String(currentUser.id) === String(userId));

  const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOwnProfile) {
      setProfileUser(currentUser);
      setLoading(false);
      setError('');
    } else {
      setLoading(true);
      setError('');
      getUserById(userId)
        .then((data) => setProfileUser(data))
        .catch((err) => setError(err.message || 'User not found'))
        .finally(() => setLoading(false));
    }
  }, [userId, isOwnProfile, currentUser]);

  useEffect(() => {
    const targetId = isOwnProfile ? currentUser?.id : userId;
    if (!targetId) return;

    getProjects()
      .then((projects) => {
        const owned = projects.filter(
          (p) => String(p.owner_id) === String(targetId)
        );
        setUserProjects(owned);
      })
      .catch(() => {});
  }, [userId, isOwnProfile, currentUser]);

  const displayedUser = isOwnProfile ? currentUser : profileUser;
  const name = displayedUser?.full_name || (loading ? 'Loading...' : 'User');
  const skills = displayedUser?.skills || [];
  const education = [displayedUser?.university, displayedUser?.year, displayedUser?.major]
    .filter(Boolean)
    .join(' · ');

  return (
    <DashboardLayout active={isOwnProfile ? 'dashboard' : 'projects'}>
      {loading && (
        <div className="py-12 text-center text-sm text-neutral-500">
          Loading profile...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">Unable to load profile</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <Link
            to="/projects"
            className="mt-4 inline-block rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            ← Back to projects
          </Link>
        </div>
      )}

      {!loading && !error && displayedUser && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-5">
              <Avatar name={name} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{name}</h1>
                <p className="text-sm text-neutral-500">
                  {education || (isOwnProfile ? 'Add your university, year, and major' : 'CollabHub member')}
                </p>
                {displayedUser.github_url && (
                  <a
                    href={
                      displayedUser.github_url.startsWith('http')
                        ? displayedUser.github_url
                        : `https://github.com/${displayedUser.github_url}`
                    }
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
                    <p className="text-xs text-neutral-400">No skills listed</p>
                  )}
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <Link
                to="/profile/edit"
                className="h-fit rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Edit profile
              </Link>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2">
              <h2 className="font-semibold text-neutral-900">About</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {displayedUser.bio ||
                  (isOwnProfile
                    ? 'No bio yet — add one from Edit profile.'
                    : 'No bio provided.')}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="font-semibold text-neutral-900">Stats</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">Projects created</dt>
                  <dd className="font-semibold text-neutral-900">{userProjects.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">Member since</dt>
                  <dd className="font-semibold text-neutral-900">
                    {formatMemberSince(displayedUser.created_at)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">
              Projects ({userProjects.length})
            </h2>
            <Link to="/projects" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
              View all →
            </Link>
          </div>

          {userProjects.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
              {isOwnProfile
                ? "You haven't created any projects yet."
                : `${name} hasn't created any public projects yet.`}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {userProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
                >
                  <div className="flex items-center justify-between">
                    <MiniBadge
                      label={project.status || 'Active'}
                      styles={STATUS_STYLES[project.status] || STATUS_STYLES.Active}
                    />
                    <MiniBadge label="Owner" styles={ROLE_STYLES.Owner} />
                  </div>
                  <h3 className="mt-3 font-semibold text-neutral-900">{project.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{project.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(project.tech_tags || []).map((tag) => (
                      <TagChip key={tag}>{tag}</TagChip>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
