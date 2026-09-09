import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProjectWorkspaceHeader from '../components/project/ProjectWorkspaceHeader.jsx';
import TaskCard from '../components/project/TaskCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getProject,
  getProjectMembers,
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
} from '../services/projects.js';

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'];

export default function ProjectBoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [initialStatus, setInitialStatus] = useState('To Do');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');

    Promise.all([
      getProject(id).catch(() => null),
      getProjectMembers(id).catch(() => []),
      getProjectTasks(id).catch(() => []),
    ])
      .then(([projData, membersData, tasksData]) => {
        if (projData) setProject(projData);
        if (Array.isArray(membersData)) {
          setMembers(membersData);
          if (membersData.length > 0) {
            setAssigneeId(membersData[0].user_id);
          }
        }
        if (Array.isArray(tasksData)) {
          setTasks(tasksData);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = Boolean(
    user && project && String(user.id) === String(project.owner_id)
  );

  const isMember = Boolean(
    isOwner || (user && members.some((m) => String(m.user_id) === String(user.id)))
  );

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );

    if (token) {
      try {
        await updateProjectTask(id, taskId, token, { status: newStatus });
      } catch (err) {
        console.warn('Could not update task on server:', err.message);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (token) {
      try {
        await deleteProjectTask(id, taskId, token);
      } catch (err) {
        console.warn('Could not delete task on server:', err.message);
      }
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    const selectedMember = members.find((m) => String(m.user_id) === String(assigneeId));
    const memberName = selectedMember ? selectedMember.name : (user?.full_name || 'Unassigned');

    try {
      if (token) {
        const created = await createProjectTask(id, token, {
          title: trimmed,
          description: description.trim(),
          assigneeId: assigneeId ? Number(assigneeId) : null,
          status: initialStatus,
        });
        setTasks((prev) => [...prev, created]);
      } else {
        // Local fallback
        setTasks((prev) => [
          ...prev,
          {
            id: Date.now(),
            projectId: Number(id),
            title: trimmed,
            description: description.trim(),
            assigneeId: assigneeId ? Number(assigneeId) : null,
            assignee: memberName,
            status: initialStatus,
          },
        ]);
      }

      setTitle('');
      setDescription('');
    } catch (err) {
      alert(err.message || 'Failed to assign task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <ProjectWorkspaceHeader
        projectId={id}
        projectName={project?.title || 'Project Workspace'}
        active="tasks"
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-neutral-900">Manage tasks</h1>
              {isOwner && (
                <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-semibold text-lime-800">
                  Owner view
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Assign tasks, track progress across members, and keep deliverables on schedule.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${id}/overview`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              View overview
            </Link>
            <Link
              to={`/projects/${id}/chat`}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Open team chat
            </Link>
          </div>
        </div>

        {/* Owner Task Assignment Section */}
        {isOwner && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-400 text-neutral-900 text-xs font-bold">
                +
              </div>
              <h2 className="text-base font-semibold text-neutral-900">Assign a new task</h2>
            </div>

            <form onSubmit={handleAssignTask} className="mt-4 space-y-3">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title (e.g., Build Khmer speech-to-text pipeline)..."
                  required
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, expectations, or reference links for the assignee..."
                  rows={2}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-neutral-500">Assign to:</label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 focus:border-neutral-900 focus:outline-none"
                    >
                      {members.length === 0 && (
                        <option value="">No other members yet</option>
                      )}
                      {members.map((member) => (
                        <option key={member.user_id || member.id} value={member.user_id}>
                          {member.name} ({member.role || 'Member'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-neutral-500">Status:</label>
                    <select
                      value={initialStatus}
                      onChange={(e) => setInitialStatus(e.target.value)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 focus:border-neutral-900 focus:outline-none"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign task'}
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-[10px] text-neutral-900 font-bold">
                    →
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task Summary Banner */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-xs text-neutral-600">
          <div className="flex items-center gap-4 font-medium">
            <span>Total tasks: <strong className="text-neutral-900">{tasks.length}</strong></span>
            <span>·</span>
            <span>In progress: <strong className="text-neutral-900">{tasks.filter((t) => t.status === 'In Progress').length}</strong></span>
            <span>·</span>
            <span>Completed: <strong className="text-neutral-900">{tasks.filter((t) => t.status === 'Done').length}</strong></span>
          </div>

          <div className="text-neutral-400">
            {members.length} team {members.length === 1 ? 'member' : 'members'} assigned
          </div>
        </div>

        {/* Kanban Board Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status);
            return (
              <div key={status} className="flex flex-col rounded-2xl bg-neutral-100 p-3 min-h-[350px]">
                <div className="flex items-center justify-between px-1 pb-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-600">{status}</p>
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                      canManage={isOwner}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 text-center">
                      <p className="text-xs text-neutral-400">No tasks in {status}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
