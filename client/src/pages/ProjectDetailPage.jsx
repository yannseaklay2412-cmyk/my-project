import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/layout/TopBar.jsx';
import ProjectWorkspaceHeader from '../components/project/ProjectWorkspaceHeader.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import TagChip from '../components/ui/TagChip.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { getProject, getProjectComments, addProjectComment, getProjectMembers, updateProject } from '../services/projects.js';
import {
  getMyCollaborationRequest,
  getProjectCollaborationRequests,
  updateCollaborationRequestStatus,
} from '../services/collaboration.js';
import CollaborationRequestModal from '../components/project/CollaborationRequestModal.jsx';
import { MOCK_PROJECT, MOCK_COMMENTS as INITIAL_COMMENTS, isProjectMember } from '../mocks/project.js';

function formatCommentTime(dateString) {
  if (!dateString) return 'now';
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('complete')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (s.includes('progress')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (s.includes('active')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  return 'bg-lime-50 text-lime-800 border-lime-200';
}

function getStatusDotClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('complete')) return 'bg-purple-500';
  if (s.includes('progress')) return 'bg-amber-500';
  if (s.includes('active')) return 'bg-blue-500';
  return 'bg-lime-500';
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [draft, setDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myRequest, setMyRequest] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [collabRequests, setCollabRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [requestFilter, setRequestFilter] = useState('all');
  const [projectStatus, setProjectStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);


  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProject(id)
      .then((data) => setProjectData(data))
      .catch((err) => {
        console.warn('Could not load project from API, using fallback data:', err.message);
      })
      .finally(() => setLoading(false));

    getProjectMembers(id)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMembersList(data);
        }
      })
      .catch(() => {});

    getProjectComments(id)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setComments(
            data.map((c) => ({
              id: c.id,
              author: c.author || 'CollabHub member',
              time: formatCommentTime(c.created_at),
              text: c.text || c.body,
            }))
          );
        }
      })
      .catch(() => {
        // Retain fallback comments if offline
      });
  }, [id]);

  const displayMembers = membersList.length > 0
    ? membersList
    : (projectData
        ? [{ name: projectData.owner_name || 'Project Owner', role: 'Owner', user_id: projectData.owner_id }]
        : MOCK_PROJECT.members);

  const PROJECT = projectData
    ? {
        id: projectData.id,
        title: projectData.title,
        status: projectData.status || 'Open for collaborators',
        description: projectData.description,
        problem: projectData.problem || 'No problem statement provided.',
        techStack: projectData.tech_tags || [],
        updatedAt: projectData.created_at
          ? new Date(projectData.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recently',
        owner: {
          id: projectData.owner_id,
          name: projectData.owner_name || 'Project Owner',
          university: projectData.owner_university || 'CollabHub member',
          year: projectData.owner_year || '',
          major: projectData.owner_major || '',
        },
        members: displayMembers,
        openSpots: Math.max(0, 5 - displayMembers.length),
        github: {
          repo: projectData.github_url ? projectData.github_url.replace(/^https?:\/\/github\.com\//, '') : 'sophea/studybuddy',
          stars: 0,
          issues: 0,
          updated: 'recently',
        },
      }
    : MOCK_PROJECT;

  const isOwner = Boolean(user && PROJECT.owner?.id && String(user.id) === String(PROJECT.owner.id));
  const isMember = Boolean(user && (isProjectMember(user) || displayMembers.some((m) => String(m.user_id) === String(user.id))));

  useEffect(() => {
    if (!token || !PROJECT.id) return;
    if (isOwner) {
      setLoadingRequests(true);
      getProjectCollaborationRequests(PROJECT.id, token)
        .then((data) => setCollabRequests(Array.isArray(data) ? data : []))
        .catch((err) => console.warn('Could not fetch collaboration requests:', err.message))
        .finally(() => setLoadingRequests(false));
    } else {
      getMyCollaborationRequest(PROJECT.id, token)
        .then((req) => setMyRequest(req))
        .catch(() => {});
    }
  }, [PROJECT.id, token, isOwner]);

  const handleRespondRequest = async (requestId, newStatus) => {
    if (!token || !PROJECT.id) return;
    setActionLoadingId(requestId);
    try {
      const updated = await updateCollaborationRequestStatus(PROJECT.id, requestId, newStatus, token);
      setCollabRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: updated.status } : r))
      );

      // Refresh members list so newly accepted member immediately appears
      const refreshedMembers = await getProjectMembers(PROJECT.id);
      if (Array.isArray(refreshedMembers)) {
        setMembersList(refreshedMembers);
      }
    } catch (err) {
      alert(err.message || `Failed to ${newStatus} request`);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    if (PROJECT.status) {
      setProjectStatus(PROJECT.status);
    }
  }, [PROJECT.status]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!token || !PROJECT.id) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateProject(PROJECT.id, token, { status: newStatus });
      setProjectStatus(updated.status);
      setProjectData((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      alert(err.message || 'Failed to update project status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const pendingCount = collabRequests.filter((r) => r.status === 'pending').length;
  const acceptedCount = collabRequests.filter((r) => r.status === 'accepted').length;
  const rejectedCount = collabRequests.filter((r) => r.status === 'rejected').length;

  const filteredRequests = collabRequests.filter((r) => {
    if (requestFilter === 'pending') return r.status === 'pending';
    if (requestFilter === 'accepted') return r.status === 'accepted';
    if (requestFilter === 'rejected') return r.status === 'rejected';
    return true;
  });



  const handlePostComment = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    if (!user || !token) {
      navigate('/login');
      return;
    }

    try {
      const created = await addProjectComment(PROJECT.id, token, text);
      setComments((prev) => [
        ...prev,
        {
          id: created.id,
          author: created.author || user.full_name,
          time: 'just now',
          text: created.text || created.body,
        },
      ]);
      setDraft('');
    } catch (err) {
      console.warn('Could not post comment to API, adding locally:', err.message);
      setComments((prev) => [...prev, { author: user?.full_name || 'You', time: 'now', text }]);
      setDraft('');
    }
  };

  const handleOpenCollabModal = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const isSaved = Boolean(user && isFavorite(PROJECT.id));

  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite({
      id: PROJECT.id,
      title: PROJECT.title,
      description: PROJECT.description,
      status: PROJECT.status,
      tags: PROJECT.techStack || [],
      author: {
        id: PROJECT.owner?.id,
        name: PROJECT.owner?.name,
        university: PROJECT.owner?.university,
      },
      comments: comments.length,
      collaborators: PROJECT.members?.length || 1,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {isOwner ? (
        <ProjectWorkspaceHeader
          projectId={PROJECT.id}
          projectName={PROJECT.title}
          active="overview"
        />
      ) : (
        <TopBar />
      )}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {!isOwner && (
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to feed
          </Link>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {isOwner ? (
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs transition-all ${getStatusBadgeClass(
                  projectStatus || PROJECT.status
                )}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${getStatusDotClass(
                    projectStatus || PROJECT.status
                  )}`}
                />
                <span className="font-medium text-neutral-500 mr-0.5">Status:</span>
                <select
                  aria-label="Change project status"
                  value={projectStatus || PROJECT.status}
                  disabled={updatingStatus}
                  onChange={handleStatusChange}
                  className="cursor-pointer bg-transparent font-bold text-inherit focus:outline-none pr-1"
                >
                  <option value="Open for collaborators" className="text-neutral-900 bg-white">
                    Open for collaborators
                  </option>
                  <option value="Active" className="text-neutral-900 bg-white">
                    Active
                  </option>
                  <option value="In Progress" className="text-neutral-900 bg-white">
                    In Progress
                  </option>
                  <option value="Completed" className="text-neutral-900 bg-white">
                    Completed
                  </option>
                </select>
                {updatingStatus ? (
                  <svg className="h-3.5 w-3.5 animate-spin ml-1 text-neutral-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg
                    className="h-3.5 w-3.5 opacity-60 pointer-events-none -ml-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                (Owner status selector)
              </span>
            </div>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                PROJECT.status
              )}`}
            >
              <span className={`h-2 w-2 rounded-full ${getStatusDotClass(PROJECT.status)}`} />
              {PROJECT.status}
            </span>
          )}
        </div>


        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{PROJECT.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
              <Avatar name={PROJECT.owner.name} size="sm" />
              {PROJECT.owner.name} · {PROJECT.owner.university} · {PROJECT.updatedAt}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                isSaved
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <svg
                className={`h-4 w-4 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-neutral-500'}`}
                viewBox="0 0 24 24"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isSaved ? 'Saved' : 'Save'}
            </button>

            {isOwner ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-fit items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-lime-500" />
                  Owner view
                </span>
                {pendingCount > 0 && (
                  <span className="flex h-fit items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    {pendingCount} Request{pendingCount > 1 ? 's' : ''} to review
                  </span>
                )}
                <Link
                  to={`/projects/${PROJECT.id}/tasks`}
                  className="flex h-fit items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Manage Tasks
                </Link>
                <Link
                  to={`/projects/${PROJECT.id}/chat`}
                  className="flex h-fit items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors"
                >
                  <svg className="h-3.5 w-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  Chat
                </Link>
              </div>
            ) : isMember ? (
              <Link
                to={`/projects/${PROJECT.id}/chat`}
                className="flex h-fit items-center gap-3 rounded-full bg-neutral-900 py-2 pl-5 pr-2 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Go to team chat
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-neutral-900">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </span>
              </Link>
            ) : myRequest ? (
              <span className="flex h-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Request Pending ({myRequest.preferred_role || 'Member'})
              </span>
            ) : (
              <button
                type="button"
                onClick={handleOpenCollabModal}
                className="flex h-fit items-center gap-3 rounded-full bg-neutral-900 py-2 pl-5 pr-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Request to Collaborate
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400 text-neutral-900">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
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

            {/* Owner Only: Collaboration Requests Section */}
            {isOwner && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-neutral-900">Collaboration Requests</h2>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                          {collabRequests.length}
                        </span>
                        {pendingCount > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {pendingCount} pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">Only visible to you as the project owner</p>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 text-xs font-medium text-neutral-600">
                    <button
                      type="button"
                      onClick={() => setRequestFilter('all')}
                      className={`rounded-md px-2.5 py-1 transition-colors ${
                        requestFilter === 'all'
                          ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                          : 'hover:text-neutral-900'
                      }`}
                    >
                      All ({collabRequests.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestFilter('pending')}
                      className={`rounded-md px-2.5 py-1 transition-colors ${
                        requestFilter === 'pending'
                          ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                          : 'hover:text-neutral-900'
                      }`}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestFilter('accepted')}
                      className={`rounded-md px-2.5 py-1 transition-colors ${
                        requestFilter === 'accepted'
                          ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                          : 'hover:text-neutral-900'
                      }`}
                    >
                      Accepted ({acceptedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestFilter('rejected')}
                      className={`rounded-md px-2.5 py-1 transition-colors ${
                        requestFilter === 'rejected'
                          ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                          : 'hover:text-neutral-900'
                      }`}
                    >
                      Rejected ({rejectedCount})
                    </button>
                  </div>
                </div>

                {/* Requests List */}
                <div className="mt-4 space-y-4">
                  {loadingRequests ? (
                    <div className="flex items-center justify-center py-8 text-sm text-neutral-400">
                      <svg className="h-5 w-5 animate-spin text-neutral-400 mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Loading requests...
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-500">
                      {collabRequests.length === 0
                        ? 'No collaboration requests received yet. When students submit a request to join, you will review them here.'
                        : `No ${requestFilter} requests found.`}
                    </div>
                  ) : (
                    filteredRequests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 transition-all hover:border-neutral-300"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <Avatar name={req.requester_name} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/u/${req.requester_id}`}
                                  className="font-semibold text-neutral-900 hover:text-lime-600 hover:underline"
                                >
                                  {req.requester_name}
                                </Link>
                                {req.preferred_role && (
                                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
                                    {req.preferred_role}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500">
                                {[req.requester_university, req.requester_major, req.requester_year && `Year ${req.requester_year}`]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">{formatCommentTime(req.created_at)}</span>
                            {req.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending
                              </span>
                            )}
                            {req.status === 'accepted' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-semibold text-lime-800">
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                Accepted
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                                Declined
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg bg-white p-3 border border-neutral-200/80">
                          <p className="text-xs font-medium text-neutral-400 mb-1">Message:</p>
                          <p className="text-sm text-neutral-700 whitespace-pre-line leading-relaxed">{req.message}</p>
                        </div>

                        {(req.skills?.length > 0 || req.portfolio_url) && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                            {req.skills?.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-neutral-400">Skills:</span>
                                {req.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-700 border border-neutral-200"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            {req.portfolio_url && (
                              <a
                                href={req.portfolio_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-lime-700 hover:text-lime-800 hover:underline"
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                Portfolio / GitHub ↗
                              </a>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-200/60 pt-3">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                disabled={actionLoadingId === req.id}
                                onClick={() => handleRespondRequest(req.id, 'rejected')}
                                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                              >
                                <svg className="h-3.5 w-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                              <button
                                type="button"
                                disabled={actionLoadingId === req.id}
                                onClick={() => handleRespondRequest(req.id, 'accepted')}
                                className="inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-4 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-lime-500 disabled:opacity-50 transition-colors shadow-xs"
                              >
                                {actionLoadingId === req.id ? (
                                  'Updating...'
                                ) : (
                                  <>
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                    Accept to Team
                                  </>
                                )}
                              </button>
                            </>
                          ) : req.status === 'accepted' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-lime-700 font-medium flex items-center gap-1">
                                <svg className="h-3.5 w-3.5 text-lime-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Accepted as team member
                              </span>
                              <button
                                type="button"
                                disabled={actionLoadingId === req.id}
                                onClick={() => handleRespondRequest(req.id, 'rejected')}
                                className="text-xs text-neutral-400 hover:text-rose-600 underline ml-2"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-400">Application declined</span>
                              <button
                                type="button"
                                disabled={actionLoadingId === req.id}
                                onClick={() => handleRespondRequest(req.id, 'accepted')}
                                className="text-xs text-lime-600 hover:text-lime-700 font-medium underline ml-2"
                              >
                                Reconsider & Accept
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

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
              <Link
                to={`/u/${PROJECT.owner.id || 1}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-lime-600 hover:text-lime-700"
              >
                View profile →
              </Link>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="text-sm font-semibold text-neutral-900">Team members ({PROJECT.members.length})</p>
              <div className="mt-3 space-y-3">
                {PROJECT.members.map((member, idx) => (
                  <div key={member.user_id || member.id || member.name || idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={member.name} size="sm" />
                      {member.user_id ? (
                        <Link
                          to={`/u/${member.user_id}`}
                          className="text-sm font-medium text-neutral-900 hover:text-lime-600 hover:underline transition-colors"
                        >
                          {member.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-neutral-900">{member.name}</span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 capitalize">{member.role}</span>
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

      <CollaborationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={PROJECT}
        token={token}
        onSuccess={(createdReq) => setMyRequest(createdReq)}
      />
    </div>
  );
}
