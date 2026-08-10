import Avatar from '../ui/Avatar.jsx';

const CATEGORY_STYLES = {
  Design: 'bg-violet-100 text-violet-700',
  Dev: 'bg-blue-100 text-blue-700',
  Learning: 'bg-amber-100 text-amber-700',
};

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export default function ResourceCard({ resource, featured = false }) {
  const { title, category, description, link, votes, author, comments } = resource;

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <div
        className={`flex w-14 shrink-0 flex-col items-center gap-1 rounded-xl py-2 ${
          featured ? 'bg-lime-400 text-neutral-900' : 'bg-neutral-100 text-neutral-400'
        }`}
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill={featured ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 4l8 8h-6v8h-4v-8H4z" />
        </svg>
        <span className="text-sm font-bold">{votes}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}>
            {category}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-sm font-medium text-lime-600 hover:text-lime-700"
        >
          {getDomain(link)} ↗
        </a>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="flex items-center gap-2">
          <Avatar name={author.name} size="sm" />
          <span className="text-sm font-medium text-neutral-900">{author.name}</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {comments}
        </span>
      </div>
    </div>
  );
}
