import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar.jsx';
import SelectPill from '../components/ui/SelectPill.jsx';
import ResourceCard from '../components/resource/ResourceCard.jsx';
import { getResources, toggleResourceVote } from '../services/resources.js';
import { useAuth } from '../context/AuthContext.jsx';

function mapResource(row) {
  return {
    id: row.id,
    title: row.name,
    category: row.category,
    description: row.description,
    link: row.url,
    author: { name: row.owner_name },
    votes: Number(row.upvotes) || 0,
    has_voted: Boolean(row.has_voted),
    comments: 0,
  };
}

export default function ResourcesPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('Most upvoted');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResources = useCallback(() => {
    setLoading(true);
    setError('');
    getResources(token, { category: category === 'All' ? '' : category, sort })
      .then((rows) => setResources(rows.map(mapResource)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, category, sort]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleVote = async (resourceId) => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    // Optimistic UI update
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          const nextHasVoted = !r.has_voted;
          return {
            ...r,
            has_voted: nextHasVoted,
            votes: nextHasVoted ? r.votes + 1 : Math.max(0, r.votes - 1),
          };
        }
        return r;
      })
    );

    try {
      const res = await toggleResourceVote(resourceId, token);
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId ? { ...r, votes: res.upvotes, has_voted: res.hasVoted } : r
        )
      );
    } catch (err) {
      console.error('Failed to vote:', err);
      // Revert if error
      loadResources();
    }
  };

  const visibleResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 sm:pb-12">
      <TopBar />

      <main className="mx-auto max-w-5xl px-3.5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Shared resources</h1>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-neutral-500">
              Discover and share tools, libraries, and learning materials curated by the student
              community. Upvote your favorites!
            </p>
          </div>
          <Link
            to="/resources/new"
            className="w-full sm:w-auto justify-between sm:justify-center flex items-center gap-3 rounded-full bg-neutral-900 py-2 pl-5 pr-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            Share a resource
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-neutral-900">
              +
            </span>
          </Link>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:min-w-55 sm:flex-1">
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
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SelectPill
              label="All Categories"
              options={['All', 'Design', 'Dev', 'Learning']}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <SelectPill
              label="Sort by"
              options={['Most upvoted', 'Newest', 'Oldest']}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
        </div>

        {loading && <p className="mt-8 text-sm text-neutral-500">Loading resources...</p>}
        {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 flex flex-col gap-4">
            {visibleResources.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
                <p className="text-sm font-medium text-neutral-600">No resources found</p>
                <p className="mt-1 text-xs text-neutral-400">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            ) : (
              visibleResources.map((resource, index) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  featured={index === 0 && (!category || category === 'All') && sort === 'Most upvoted'}
                  onVote={handleVote}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
