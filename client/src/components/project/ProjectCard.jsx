import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import TagChip from '../ui/TagChip.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { id, title, description, status, tags, author, collaborators, comments } = project;
  const isSaved = Boolean(user && isFavorite(id));

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite(project);
  };

  const isOwner = Boolean(
    user && (
      (author?.id && String(user.id) === String(author.id)) ||
      (project.owner_id && String(user.id) === String(project.owner_id))
    )
  );

  const targetUrl = isOwner ? `/projects/${id}/overview` : `/projects/${id}`;

  return (
    <Link
      to={targetUrl}
      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {isOwner && (
            <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold text-lime-800">
              Your project
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSaveClick}
          aria-label={!user ? 'Sign in to save' : isSaved ? 'Remove from favorites' : 'Save to favorites'}
          title={!user ? 'Sign in to save' : isSaved ? 'Remove from favorites' : 'Save to favorites'}
          className={`rounded-full p-1 transition-all ${
            isSaved
              ? 'text-amber-500 hover:text-amber-600 hover:scale-110'
              : 'text-neutral-300 hover:text-neutral-600 hover:scale-110'
          }`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <TagChip key={tag}>{tag}</TagChip>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div
          onClick={(e) => {
            if (author?.id) {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/u/${author.id}`);
            }
          }}
          className={`flex items-center gap-2 ${author?.id ? 'hover:opacity-80 cursor-pointer' : ''}`}
        >
          <Avatar name={author.name} size="sm" />
          <div className="leading-tight">
            <p className="text-sm font-medium text-neutral-900">{author.name}</p>
            <p className="text-xs text-neutral-400">{author.university}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-neutral-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {collaborators}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {comments}
          </span>
        </div>
      </div>
    </Link>
  );
}
