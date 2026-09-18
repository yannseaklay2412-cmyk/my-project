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

export default function ResourceCard({ resource, featured = false, onVote }) {
  const { id, title, category, description, link, votes, has_voted, author, comments } = resource;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 hover:border-neutral-300 transition-colors">
      <div className="flex items-center sm:items-start gap-3 sm:gap-4">
        {/* Interactive Upvote Button */}
        <button
          type="button"
          onClick={() => onVote && onVote(id)}
          aria-label={has_voted ? 'Remove upvote' : 'Upvote resource'}
          title={has_voted ? 'Remove upvote' : 'Upvote'}
          className={`flex w-12 sm:w-14 shrink-0 flex-row sm:flex-col items-center justify-center gap-1.5 sm:gap-1 rounded-xl py-1.5 sm:py-2 px-2.5 sm:px-0 transition-all cursor-pointer select-none active:scale-95 border ${
            has_voted
              ? 'bg-lime-400 text-neutral-900 border-lime-400 font-bold shadow-xs hover:bg-lime-300'
              : featured
              ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
              : 'bg-neutral-100 text-neutral-600 border-neutral-200/60 hover:bg-neutral-200 hover:text-neutral-900'
          }`}
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${has_voted ? 'scale-110' : 'group-hover:-translate-y-0.5'}`}
            viewBox="0 0 24 24"
            fill={has_voted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 4l8 8h-6v8h-4v-8H4z" />
          </svg>
          <span className="text-xs sm:text-sm font-bold">{votes}</span>
        </button>

        <div className="min-w-0 flex-1 sm:hidden">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_STYLES[category] || 'bg-neutral-100 text-neutral-700'}`}>
              {category}
            </span>
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="hidden sm:flex items-center gap-2">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category] || 'bg-neutral-100 text-neutral-700'}`}>
            {category}
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500">{description}</p>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-xs sm:text-sm font-medium text-lime-600 hover:text-lime-700 break-all"
        >
          {getDomain(link)} ↗
        </a>
      </div>

      <div className="flex shrink-0 items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t border-neutral-100 pt-3 sm:border-0 sm:pt-0">
        <div className="flex items-center gap-2">
          <Avatar name={author.name} size="sm" />
          <span className="text-xs sm:text-sm font-medium text-neutral-900">{author.name}</span>
        </div>
        {comments > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {comments}
          </span>
        )}
      </div>
    </div>
  );
}
