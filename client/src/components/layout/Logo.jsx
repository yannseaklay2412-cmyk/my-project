import { Link } from 'react-router-dom';

export default function Logo({ variant = 'dark' }) {
  const isLight = variant === 'light';

  return (
    <Link
      to="/"
      className={`flex items-center gap-2 text-lg font-semibold ${isLight ? 'text-white' : 'text-neutral-900'}`}
    >
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${isLight ? 'bg-lime-400' : ''}`}>
        <span className="h-3 w-3 rotate-45 rounded-xs bg-neutral-900" />
      </span>
      CollabHub
    </Link>
  );
}
