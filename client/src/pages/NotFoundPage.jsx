import { Link } from 'react-router-dom';
import TopBar from '../components/layout/TopBar.jsx';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <span className="text-5xl font-extrabold text-neutral-300">404</span>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        <Link
          to="/projects"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
        >
          Browse Projects
        </Link>
      </div>
    </div>
  );
}
