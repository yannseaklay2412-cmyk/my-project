import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/layout/Logo.jsx';
import PillButton from '../components/ui/PillButton.jsx';
import TagInput from '../components/ui/TagInput.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createProject } from '../services/projects.js';

const STATUS_OPTIONS = ['Open for collaborators', 'In Progress', 'Completed'];

const LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wide text-neutral-700';
const INPUT_CLASS =
  'mt-2 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    problem: '',
    skills: [],
    status: STATUS_OPTIONS[0],
    githubLink: '',
  });
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const newProject = await createProject(token, {
        title: form.title,
        description: form.description,
        problem: form.problem,
        tech_tags: form.skills,
        status: form.status,
        github_url: form.githubLink,
      });
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <Logo />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-neutral-900">Post a project</h1>
        <p className="mt-1 text-neutral-500">Share your idea and find collaborators.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-2xl border border-neutral-200 bg-white p-8">
          <div>
            <label className={LABEL_CLASS}>Project title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter a concise title"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Short description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Explain the project in 1-2 sentences"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Problem it solves</label>
            <textarea
              rows={3}
              value={form.problem}
              onChange={(e) => updateField('problem', e.target.value)}
              placeholder="What gap or challenge does this project address?"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Tech stack / skills needed</label>
            <div className="mt-2">
              <TagInput
                value={form.skills}
                onChange={(skills) => updateField('skills', skills)}
                placeholder="Type a skill and press enter"
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Status</label>
            <div className="mt-2">
              <SegmentedControl
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(status) => updateField('status', status)}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>GitHub repo link (optional)</label>
            <div className="relative mt-2">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <input
                type="url"
                value={form.githubLink}
                onChange={(e) => updateField('githubLink', e.target.value)}
                placeholder="https://github.com/user/repo"
                className="block w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Paste a public repo URL to show live stats
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <PillButton type="submit" variant="dark">
            Publish project
          </PillButton>
        </form>
      </main>
    </div>
  );
}
