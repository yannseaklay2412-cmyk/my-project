import { useEffect, useState } from 'react';
import TagInput from '../ui/TagInput.jsx';
import { submitCollaborationRequest } from '../../services/collaboration.js';

export default function CollaborationRequestModal({
  isOpen,
  onClose,
  project,
  token,
  onSuccess,
}) {
  const [form, setForm] = useState({
    preferred_role: '',
    message: '',
    skills: [],
    portfolio_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        preferred_role: '',
        message: '',
        skills: [],
        portfolio_url: '',
      });
      setError('');
      setIsSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.message.trim()) {
      setError('Please provide a message explaining why you would like to collaborate.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitCollaborationRequest(project.id, token, {
        message: form.message.trim(),
        preferred_role: form.preferred_role.trim() || undefined,
        skills: form.skills,
        portfolio_url: form.portfolio_url.trim() || undefined,
      });

      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(response.request);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit collaboration request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="collab-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl transition-all sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close modal"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        >
          ✕
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime-100 text-lime-600">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold text-neutral-900">Request Sent!</h3>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
              Your collaboration request has been sent to{' '}
              <strong className="text-neutral-800">{project.owner?.name || 'the project owner'}</strong>.
              They will review your pitch and skills.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-50 px-2.5 py-1 text-xs font-semibold text-lime-800">
                Collaboration Request
              </span>
              <h2 id="collab-modal-title" className="mt-2 text-2xl font-bold text-neutral-900">
                Join {project.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Tell the project team what role you'd like and what skills you bring to the table.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preferred Role */}
              <div>
                <label htmlFor="preferred_role" className="block text-xs font-semibold uppercase tracking-wide text-neutral-700">
                  Preferred Role <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </label>
                <input
                  id="preferred_role"
                  type="text"
                  placeholder="e.g. Frontend Developer, UI Designer, Data Analyst"
                  value={form.preferred_role}
                  onChange={(e) => setForm({ ...form, preferred_role: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
                />
              </div>

              {/* Message (Required) */}
              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wide text-neutral-700">
                  Introduction & Motivation <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={3}
                  required
                  placeholder="Why are you interested in this project? What would you like to contribute?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
                />
              </div>

              {/* Skills (Tags Array) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-700">
                  Relevant Skills <span className="font-normal normal-case text-neutral-400">(press Enter to add)</span>
                </label>
                <div className="mt-1.5">
                  <TagInput
                    value={form.skills}
                    onChange={(skills) => setForm({ ...form, skills })}
                    placeholder="Type skill (e.g. React, Python) and press Enter"
                  />
                </div>
              </div>

              {/* Portfolio / Link */}
              <div>
                <label htmlFor="portfolio_url" className="block text-xs font-semibold uppercase tracking-wide text-neutral-700">
                  Portfolio or GitHub URL <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </label>
                <input
                  id="portfolio_url"
                  type="url"
                  placeholder="https://github.com/yourhandle or https://portfolio.dev"
                  value={form.portfolio_url}
                  onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                  className="mt-1.5 block w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400 text-neutral-900">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M8 7h9v9" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
