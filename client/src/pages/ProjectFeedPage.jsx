import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import SelectPill from '../components/ui/SelectPill.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
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
    tags: row.tech_tags || [],
    author: {
      id: row.owner_id,
      name: row.owner_name,
      university: row.owner_university || 'CollabHub member',
    },
    createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    collaborators: Number(row.collaborators_count ?? row.collaborators ?? 0),
    comments: Number(row.comments_count ?? row.comments ?? 0),
  };
}

const STATUS_OPTIONS = ['Open for collaborators', 'Active', 'In Progress', 'Completed'];
const SORT_OPTIONS = ['Newest', 'Oldest', 'Most active'];

export default function ProjectFeedPage() {
  const { updateFavoriteData } = useFavorites();
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProjects()
      .then((rows) => {
        const mapped = rows.map(mapProject);
        setProjects(mapped);
        updateFavoriteData?.(mapped);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [updateFavoriteData]);

  const visibleProjects = useMemo(() => {
    const q = search.trim().toLowerCase();

    return projects
      .filter((project) => {
        // Search query across title, description, tags, author, university
        const matchesSearch =
          !q ||
          project.title.toLowerCase().includes(q) ||
          project.description?.toLowerCase().includes(q) ||
          project.author?.name?.toLowerCase().includes(q) ||
          project.author?.university?.toLowerCase().includes(q) ||
          project.tags?.some((t) => t.toLowerCase().includes(q));

        // Status filter
        const matchesStatus =
          !selectedStatus ||
          project.status?.toLowerCase() === selectedStatus.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'Oldest':
            return (a.createdAt || a.id || 0) - (b.createdAt || b.id || 0);
          case 'Most active':
            return b.collaborators + b.comments - (a.collaborators + a.comments);
          case 'Newest':
          default:
            return (b.createdAt || b.id || 0) - (a.createdAt || a.id || 0);
        }
      });
  }, [projects, search, selectedStatus, sortBy]);

  const hasActiveFilters = Boolean(
    search || selectedStatus || sortBy !== 'Newest'
  );

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('');
    setSortBy('Newest');
  };

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
            placeholder="Search projects by title, description, school, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
        </div>

        <SelectPill
          label="Status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={STATUS_OPTIONS}
        />

        <div className="flex items-center gap-2 ml-auto">
          <SelectPill
            label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value || 'Newest')}
            options={SORT_OPTIONS}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 underline transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading && <p className="mt-8 text-sm text-neutral-500">Loading projects...</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {!loading && !error && visibleProjects.length === 0 && (
        <div className="mt-12 text-center py-10 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50">
          <p className="text-neutral-600 font-medium">No projects match your current filters</p>
          <p className="mt-1 text-sm text-neutral-400">
            Try adjusting your search keywords, clearing selected filters, or changing sort order.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && visibleProjects.length > 0 && (
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
