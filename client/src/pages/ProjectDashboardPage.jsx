import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectWorkspaceHeader from '../components/project/ProjectWorkspaceHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import TagChip from '../components/ui/TagChip.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { MOCK_PROJECT as PROJECT, MOCK_COMMENTS as INITIAL_COMMENTS } from '../mocks/project.js';

export default function ProjectDashboardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [draft, setDraft] = useState('');

  const handlePostComment = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    // Not wired to the backend yet — local state only for now.
    setComments((prev) => [...prev, { author: user?.full_name || 'You', time: 'now', text }]);
    setDraft('');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <ProjectWorkspaceHeader projectId={id} projectName="StudyBuddy" active="overview" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="font-semibold text-neutral-900">About this project</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{PROJECT.description}</p>

              <h3 className="mt-5 font-semibold text-neutral-900">Problem it solves</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{PROJECT.problem}</p>

              <h3 className="mt-5 font-semibold text-neutral-900">Tech stack needed</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PROJECT.techStack.map((tech) => (
                  <TagChip key={tech}>{tech}</TagChip>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="font-semibold text-neutral-900">Discussion ({comments.length})</h2>

              <form onSubmit={handlePostComment} className="mt-4 flex items-center gap-3">
                <Avatar name={user?.full_name || 'Guest'} size="sm" />
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a public comment..."
                  className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Post
                </button>
              </form>

              <div className="mt-5 space-y-4 border-t border-neutral-100 pt-4">
                {comments.map((comment, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar name={comment.author} size="sm" />
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold text-neutral-900">{comment.author}</span>{' '}
                        <span className="text-xs text-neutral-400">{comment.time}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-neutral-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Project owner</p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={PROJECT.owner.name} size="md" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{PROJECT.owner.name}</p>
                  <p className="text-xs text-neutral-400">
                    {PROJECT.owner.university} · {PROJECT.owner.year} · {PROJECT.owner.major}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="text-sm font-semibold text-neutral-900">Team members ({PROJECT.members.length})</p>
              <div className="mt-3 space-y-3">
                {PROJECT.members.map((member) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={member.name} size="sm" />
                      <span className="text-sm text-neutral-900">{member.name}</span>
                    </div>
                    <span className="text-xs text-neutral-400">{member.role}</span>
                  </div>
                ))}
              </div>
              {PROJECT.openSpots > 0 && (
                <p className="mt-4 rounded-full bg-lime-50 px-3 py-1.5 text-center text-xs font-medium text-lime-700">
                  {PROJECT.openSpots} open spots left
                </p>
              )}
            </div>

            <a
              href={`https://github.com/${PROJECT.github.repo}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl bg-neutral-900 p-6 text-white"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-lime-400 text-neutral-900">
                  <span className="h-2.5 w-2.5 rotate-45 rounded-xs bg-neutral-900" />
                </span>
                {PROJECT.github.repo}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{PROJECT.github.stars}</p>
                  <p className="text-xs text-neutral-400">Stars</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{PROJECT.github.issues}</p>
                  <p className="text-xs text-neutral-400">Open issues</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{PROJECT.github.updated}</p>
                  <p className="text-xs text-neutral-400">Updated</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-lime-400">View on GitHub ↗</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
