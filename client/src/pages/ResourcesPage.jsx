import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/layout/TopBar.jsx';
import SelectPill from '../components/ui/SelectPill.jsx';
import ResourceCard from '../components/resource/ResourceCard.jsx';
import { getResources } from '../services/resources.js';

function mapResource(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    link: row.link,
    votes: row.votes,
    author: { name: row.owner_name },
    // No comments table exists yet, so this isn't a real number.
    comments: 0,
  };
}

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getResources()
      .then((rows) => setResources(rows.map(mapResource)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Shared resources</h1>
            <p className="mt-1 max-w-xl text-neutral-500">
              Discover and share tools, libraries, and learning materials curated by the student
              community.
            </p>
          </div>
          <Link
            to="/resources/new"
            className="flex items-center gap-3 rounded-full bg-neutral-900 py-2 pl-5 pr-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Share a resource
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-neutral-900">
              +
            </span>
          </Link>
        </div>

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
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
            />
          </div>
          <SelectPill label="Category" options={['Design', 'Dev', 'Learning']} />
          <SelectPill label="Most upvoted" options={['Most upvoted', 'Newest', 'Most discussed']} />
        </div>

        {loading && <p className="mt-8 text-sm text-neutral-500">Loading resources...</p>}
        {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 flex flex-col gap-4">
            {visibleResources.map((resource, index) => (
              <ResourceCard key={resource.id} resource={resource} featured={index === 0} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
