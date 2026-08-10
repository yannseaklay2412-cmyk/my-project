import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import SelectPill from '../components/ui/SelectPill.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import { getProjects } from '../services/projects.js';

function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

function mapProject(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: capitalize(row.status),
    tags: row.tech_stack ? row.tech_stack.split(',').map((tag) => tag.trim()) : [],
    author: {
      name: row.owner_name,
      university: row.owner_university || 'CollabHub member',
    },
    // No membership/comment tables exist yet, so these aren't real numbers.
    collaborators: 0,
    comments: 0,
  };
}

export default function ProjectFeedPage() {
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProjects()
      .then((rows) => setProjects(rows.map(mapProject)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout active="projects">
      <h1 className="text-3xl font-bold text-neutral-900">Project feed</h1>
      <p className="mt-1 max-w-2xl text-neutral-500">
        Discover and collaborate on the latest research and development initiatives within your
        academic network.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-55 flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
        </div>
        <SelectPill label="Tag" options={['React', 'AI', 'Flutter', 'Python']} />
        <SelectPill label="University" options={['AUPP', 'ITC', 'RUPP', 'NUM', 'CADT']} />
        <SelectPill label="Status" options={['Active', 'Completed']} />
        <div className="ml-auto">
          <SelectPill label="Newest" options={['Newest', 'Oldest', 'Most active']} />
        </div>
      </div>

      {loading && <p className="mt-8 text-sm text-neutral-500">Loading projects...</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <Link
        to="/projects/new"
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-neutral-900 py-3 pl-5 pr-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-neutral-800"
      >
        New project
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-neutral-900">
          +
        </span>
      </Link>
    </DashboardLayout>
  );
}
