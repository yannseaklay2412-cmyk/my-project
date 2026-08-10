import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/layout/Logo.jsx';
import PillButton from '../components/ui/PillButton.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';

const CATEGORY_OPTIONS = ['Design', 'Dev', 'Learning'];

const LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wide text-neutral-700';
const INPUT_CLASS =
  'mt-2 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none';

export default function ShareResourcePage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORY_OPTIONS[0],
    link: '',
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Not wired to the backend yet — this is UI-only for now.
    console.log('Resource form (not yet submitted to backend):', form);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <Logo />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/resources"
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
          Back to resources
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-neutral-900">Share a resource</h1>
        <p className="mt-1 text-neutral-500">
          Help other students discover useful tools and learning materials.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-2xl border border-neutral-200 bg-white p-8">
          <div>
            <label className={LABEL_CLASS}>Resource title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Excalidraw"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="What is it, and why is it useful?"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Category</label>
            <div className="mt-2">
              <SegmentedControl
                options={CATEGORY_OPTIONS}
                value={form.category}
                onChange={(category) => updateField('category', category)}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Link</label>
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
                value={form.link}
                onChange={(e) => updateField('link', e.target.value)}
                placeholder="https://example.com"
                className="block w-full rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          <PillButton type="submit" variant="dark">
            Share resource
          </PillButton>
        </form>
      </main>
    </div>
  );
}
