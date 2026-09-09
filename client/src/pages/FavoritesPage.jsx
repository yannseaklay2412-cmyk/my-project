import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import SelectPill from '../components/ui/SelectPill.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
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

const SORT_OPTIONS = ['Newest saved', 'Oldest saved', 'Title (A-Z)', 'School (A-Z)'];

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, updateFavoriteData, refreshFavorites, loading } = useFavorites();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('Newest saved');

  // Keep saved favorites fresh from database when user is authenticated
  useEffect(() => {
    if (!user) return;
    refreshFavorites();
  }, [user, refreshFavorites]);

  const universityOptions = useMemo(() => {
    return Array.from(
      new Set(favorites.map((p) => p.author?.university).filter(Boolean))
    );
  }, [favorites]);

  const tagOptions = useMemo(() => {
    return Array.from(
      new Set(favorites.flatMap((p) => p.tags || []).filter(Boolean))
    );
  }, [favorites]);

  const statusOptions = useMemo(() => {
    return Array.from(
      new Set(favorites.map((p) => p.status).filter(Boolean))
    );
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    const q = search.trim().toLowerCase();

    return favorites
      .filter((project) => {
        // Search query
        const matchesSearch =
          !q ||
          project.title?.toLowerCase().includes(q) ||
          project.description?.toLowerCase().includes(q) ||
          project.author?.name?.toLowerCase().includes(q) ||
          project.author?.university?.toLowerCase().includes(q) ||
          project.tags?.some((t) => t.toLowerCase().includes(q));

        // Tag filter
        const matchesTag =
          !selectedTag ||
          project.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

        // University filter
        const matchesUniversity =
          !selectedUniversity ||
          project.author?.university?.toLowerCase() === selectedUniversity.toLowerCase();

        // Status filter
        const matchesStatus =
          !selectedStatus ||
          project.status?.toLowerCase() === selectedStatus.toLowerCase();

        return matchesSearch && matchesTag && matchesUniversity && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'Oldest saved':
            return (a.savedAt || a.id || 0) - (b.savedAt || b.id || 0);
          case 'Title (A-Z)':
            return (a.title || '').localeCompare(b.title || '');
          case 'School (A-Z)':
            return (a.author?.university || '').localeCompare(b.author?.university || '');
          case 'Newest saved':
          default:
            return (b.savedAt || b.id || 0) - (a.savedAt || a.id || 0);
        }
      });
  }, [favorites, search, selectedTag, selectedUniversity, selectedStatus, sortBy]);

  const hasActiveFilters = Boolean(
    search || selectedTag || selectedUniversity || selectedStatus || sortBy !== 'Newest saved'
  );

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTag('');
    setSelectedUniversity('');
    setSelectedStatus('');
    setSortBy('Newest saved');
  };

  if (!user) {
    return (
      <DashboardLayout active="favorites">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-neutral-900">Sign in to view saved projects</h2>
          <p className="mt-2 max-w-md text-sm text-neutral-500">
            Saved projects are private and tied to your CollabHub account. Log in to access your saved favorites.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800"
          >
            Sign in
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="favorites">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Favorites</h1>
          <p className="mt-1 max-w-2xl text-neutral-500">
            Keep track of projects you have bookmarked for collaboration, inspiration, or future participation.
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
              {favorites.length} saved {favorites.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={
            <svg
              className="h-7 w-7 text-neutral-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          }
          title="No favorite projects yet"
          description="Click the bookmark icon on any project card in the feed to save it here for quick access."
          action={
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800"
            >
              Browse project feed
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-neutral-900">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          }
        />
      ) : (
        <>
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
                placeholder="Search saved projects by title, school, or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>

            {tagOptions.length > 0 && (
              <SelectPill
                label="Tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                options={tagOptions}
              />
            )}

            {universityOptions.length > 0 && (
              <SelectPill
                label="University"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                options={universityOptions}
              />
            )}

            {statusOptions.length > 0 && (
              <SelectPill
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={statusOptions}
              />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <SelectPill
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value || 'Newest saved')}
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

          {filteredFavorites.length === 0 ? (
            <div className="mt-8 text-center py-10 rounded-2xl border border-dashed border-neutral-200 bg-white">
              <p className="text-neutral-600 font-medium">No saved projects match your filters</p>
              <p className="mt-1 text-sm text-neutral-400">
                Try clearing your search terms or adjusting the filter selections.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFavorites.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
