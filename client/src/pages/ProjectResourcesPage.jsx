import { Navigate, useParams } from 'react-router-dom';
import ProjectWorkspaceHeader from '../components/project/ProjectWorkspaceHeader.jsx';
import ProjectResourceCard from '../components/project/ProjectResourceCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { isProjectMember } from '../mocks/project.js';

const RESOURCES = [
  {
    id: 1,
    icon: 'code',
    title: 'Official GitHub Repository',
    url: 'https://github.com/team-synergy/study-buddy-api-v1',
    addedBy: 'Marcus Chen',
    addedOn: 'Oct 12',
  },
  {
    id: 2,
    icon: 'design',
    title: 'Figma UI Mockups & Design System',
    url: 'https://figma.com/file/study-buddy-v2-mockups-final',
    addedBy: 'Sarah Jenkins',
    addedOn: 'Oct 15',
  },
  {
    id: 3,
    icon: 'doc',
    title: 'Shared Project Drive & IEEE Draft',
    url: 'https://docs.google.com/folders/study-buddy-resources',
    addedBy: 'Elena Rossi',
    addedOn: 'Oct 18',
  },
  {
    id: 4,
    icon: 'slides',
    title: 'Lecture Slides — Week 8',
    url: 'https://drive.google.com/slides/cs101-week-8-architectures',
    addedBy: 'Alex Thompson',
    addedOn: 'Oct 20',
  },
];

export default function ProjectResourcesPage() {
  const { id } = useParams();
  const { user } = useAuth();

  if (!isProjectMember(user)) {
    return <Navigate to={`/projects/${id}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <ProjectWorkspaceHeader projectId={id} projectName="StudyBuddy" active="resources" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-lime-600">Team resource hub</p>
            <h1 className="mt-2 text-2xl font-bold text-neutral-900">Project Links &amp; Reference Assets</h1>
            <p className="mt-1 max-w-xl text-sm text-neutral-500">
              Centralized access to code repos, Figma prototypes, Google Docs, and lecture slide decks.
            </p>
          </div>
          <button className="flex h-fit items-center gap-2 rounded-full bg-neutral-900 py-2.5 pl-2 pr-5 text-sm font-semibold text-white hover:bg-neutral-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-neutral-900">
              +
            </span>
            Add Resource Link
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {RESOURCES.map((resource) => (
            <ProjectResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </main>
    </div>
  );
}
